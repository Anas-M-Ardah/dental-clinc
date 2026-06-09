using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DentalClinic.Infrastructure.Services;

public class DoctorAuthService : IDoctorAuthService
{
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

    private readonly IDoctorAuthRepository _doctorAuthRepository;
    private readonly IConfiguration _configuration;

    public DoctorAuthService(
        IDoctorAuthRepository doctorAuthRepository,
        IConfiguration configuration)
    {
        _doctorAuthRepository = doctorAuthRepository;
        _configuration = configuration;
    }

    public async Task<DoctorAuthResponseDto> LoginAsync(DoctorLoginDto dto)
    {
        var doctor = await _doctorAuthRepository.GetByEmailAsync(dto.Email);

        if (doctor == null || !doctor.IsActive || string.IsNullOrEmpty(doctor.PasswordHash))
            throw new KeyNotFoundException("Invalid credentials.");

        if (doctor.LockoutEnd.HasValue && doctor.LockoutEnd > DateTime.UtcNow)
        {
            var remaining = (int)Math.Ceiling((doctor.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
            throw new InvalidOperationException($"Account is locked. Try again in {remaining} minute(s).");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, doctor.PasswordHash))
        {
            doctor.FailedLoginAttempts++;
            if (doctor.FailedLoginAttempts >= MaxFailedAttempts)
            {
                doctor.LockoutEnd = DateTime.UtcNow.Add(LockoutDuration);
                doctor.FailedLoginAttempts = 0;
                await _doctorAuthRepository.UpdateAsync(doctor);
                throw new InvalidOperationException($"Account locked due to {MaxFailedAttempts} failed attempts. Try again in {LockoutDuration.TotalMinutes} minutes.");
            }
            await _doctorAuthRepository.UpdateAsync(doctor);
            throw new KeyNotFoundException("Invalid credentials.");
        }

        doctor.FailedLoginAttempts = 0;
        doctor.LockoutEnd = null;
        doctor.LastLoginAt = DateTime.UtcNow;

        return await GenerateAuthResponse(doctor);
    }

    public async Task<DoctorAuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var doctor = await _doctorAuthRepository.GetByRefreshTokenAsync(refreshToken);

        if (doctor == null || !doctor.IsActive)
            throw new KeyNotFoundException("Invalid refresh token.");

        if (doctor.RefreshTokenExpiry < DateTime.UtcNow)
        {
            doctor.RefreshToken = null;
            doctor.RefreshTokenExpiry = null;
            await _doctorAuthRepository.UpdateAsync(doctor);
            throw new InvalidOperationException("Refresh token has expired. Please login again.");
        }

        return await GenerateAuthResponse(doctor);
    }

    public async Task<DoctorProfileDto> GetProfileAsync(int doctorId)
    {
        var doctor = await _doctorAuthRepository.GetByIdAsync(doctorId)
            ?? throw new KeyNotFoundException("Doctor not found.");
        return MapToProfile(doctor);
    }

    public async Task<DoctorProfileDto> UpdateProfileAsync(int doctorId, UpdateDoctorProfileDto dto)
    {
        var doctor = await _doctorAuthRepository.GetByIdAsync(doctorId)
            ?? throw new KeyNotFoundException("Doctor not found.");

        doctor.FirstName = dto.FirstName;
        doctor.LastName = dto.LastName;
        doctor.Phone = dto.Phone;
        doctor.Email = dto.Email;
        doctor.Bio = dto.Bio;

        await _doctorAuthRepository.UpdateAsync(doctor);
        return MapToProfile(doctor);
    }

    public async Task ChangePasswordAsync(int doctorId, DoctorChangePasswordDto dto)
    {
        var doctor = await _doctorAuthRepository.GetByIdAsync(doctorId)
            ?? throw new KeyNotFoundException("Doctor not found.");

        if (string.IsNullOrEmpty(doctor.PasswordHash) ||
            !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, doctor.PasswordHash))
            throw new InvalidOperationException("Current password is incorrect.");

        doctor.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _doctorAuthRepository.UpdateAsync(doctor);
    }

    private async Task<DoctorAuthResponseDto> GenerateAuthResponse(Doctor doctor)
    {
        var expiryHours = int.TryParse(_configuration["Jwt:ExpiryHours"], out var h) ? h : 8;
        var expiresAt = DateTime.UtcNow.AddHours(expiryHours);
        var token = GenerateJwtToken(doctor, expiresAt);

        var refreshToken = GenerateRefreshToken();
        doctor.RefreshToken = refreshToken;
        doctor.RefreshTokenExpiry = DateTime.UtcNow.Add(RefreshTokenLifetime);
        await _doctorAuthRepository.UpdateAsync(doctor);

        return new DoctorAuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            DoctorId = doctor.Id,
            FullName = $"Dr. {doctor.FirstName} {doctor.LastName}",
            Email = doctor.Email ?? string.Empty,
            Specialization = doctor.Specialization
        };
    }

    private string GenerateJwtToken(Doctor doctor, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, doctor.Id.ToString()),
            new Claim(ClaimTypes.Email, doctor.Email ?? string.Empty),
            new Claim(ClaimTypes.Role, "doctor"),
            new Claim("doctorSpecialization", doctor.Specialization)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private static DoctorProfileDto MapToProfile(Doctor doctor) => new()
    {
        Id = doctor.Id,
        FirstName = doctor.FirstName,
        LastName = doctor.LastName,
        Specialization = doctor.Specialization,
        Phone = doctor.Phone,
        Email = doctor.Email,
        Bio = doctor.Bio,
        IsAvailable = doctor.IsAvailable,
        CreatedAt = doctor.CreatedAt
    };
}
