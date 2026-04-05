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

public class AdminAuthService : IAdminAuthService
{
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

    private readonly IAdminUserRepository _adminUserRepository;
    private readonly IConfiguration _configuration;

    public AdminAuthService(
        IAdminUserRepository adminUserRepository,
        IConfiguration configuration)
    {
        _adminUserRepository = adminUserRepository;
        _configuration = configuration;
    }

    public async Task<AdminAuthResponseDto> LoginAsync(AdminLoginDto dto)
    {
        var admin = await _adminUserRepository.GetByEmailAsync(dto.Email);

        if (admin == null || !admin.IsActive)
            throw new KeyNotFoundException("Invalid credentials.");

        if (admin.LockoutEnd.HasValue && admin.LockoutEnd > DateTime.UtcNow)
        {
            var remaining = (int)Math.Ceiling((admin.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
            throw new InvalidOperationException($"Account is locked. Try again in {remaining} minute(s).");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, admin.PasswordHash))
        {
            admin.FailedLoginAttempts++;
            if (admin.FailedLoginAttempts >= MaxFailedAttempts)
            {
                admin.LockoutEnd = DateTime.UtcNow.Add(LockoutDuration);
                admin.FailedLoginAttempts = 0;
                await _adminUserRepository.UpdateAsync(admin);
                throw new InvalidOperationException($"Account locked due to {MaxFailedAttempts} failed attempts. Try again in {LockoutDuration.TotalMinutes} minutes.");
            }
            await _adminUserRepository.UpdateAsync(admin);
            throw new KeyNotFoundException("Invalid credentials.");
        }

        admin.FailedLoginAttempts = 0;
        admin.LockoutEnd = null;
        admin.LastLoginAt = DateTime.UtcNow;

        return await GenerateAuthResponse(admin);
    }

    public async Task<AdminAuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var admin = await _adminUserRepository.GetByRefreshTokenAsync(refreshToken);

        if (admin == null || !admin.IsActive)
            throw new KeyNotFoundException("Invalid refresh token.");

        if (admin.RefreshTokenExpiry < DateTime.UtcNow)
        {
            admin.RefreshToken = null;
            admin.RefreshTokenExpiry = null;
            await _adminUserRepository.UpdateAsync(admin);
            throw new InvalidOperationException("Refresh token has expired. Please login again.");
        }

        return await GenerateAuthResponse(admin);
    }

    private async Task<AdminAuthResponseDto> GenerateAuthResponse(AdminUser admin)
    {
        var expiryHours = int.TryParse(_configuration["Jwt:ExpiryHours"], out var h) ? h : 8;
        var expiresAt = DateTime.UtcNow.AddHours(expiryHours);
        var token = GenerateJwtToken(admin, expiresAt);

        var refreshToken = GenerateRefreshToken();
        admin.RefreshToken = refreshToken;
        admin.RefreshTokenExpiry = DateTime.UtcNow.Add(RefreshTokenLifetime);
        await _adminUserRepository.UpdateAsync(admin);

        return new AdminAuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            AdminId = admin.Id,
            FullName = admin.FullName,
            Email = admin.Email,
            Role = admin.Role.ToString()
        };
    }

    private string GenerateJwtToken(AdminUser admin, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new Claim(ClaimTypes.Email, admin.Email),
            new Claim(ClaimTypes.Role, "admin"),
            new Claim("adminRole", admin.Role.ToString())
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
}
