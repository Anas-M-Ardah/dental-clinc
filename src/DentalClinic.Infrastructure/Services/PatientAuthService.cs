using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DentalClinic.Infrastructure.Services;

public class PatientAuthService : IPatientAuthService
{
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

    private readonly IPatientRepository _patientRepository;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public PatientAuthService(
        IPatientRepository patientRepository,
        IAppointmentRepository appointmentRepository,
        IConfiguration configuration,
        IEmailService emailService)
    {
        _patientRepository = patientRepository;
        _appointmentRepository = appointmentRepository;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> RegisterAsync(PatientRegisterDto dto)
    {
        var existing = await _patientRepository.GetByEmailAsync(dto.Email);

        if (existing != null && existing.IsPortalEnabled)
            throw new InvalidOperationException("An account with this email already exists.");

        Patient patient;

        var verificationToken = GenerateRefreshToken();

        if (existing != null)
        {
            existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            existing.IsPortalEnabled = true;
            existing.IsEmailVerified = false;
            existing.EmailVerificationToken = verificationToken;
            existing.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
            existing.UpdatedAt = DateTime.UtcNow;
            patient = await _patientRepository.UpdateAsync(existing);
        }
        else
        {
            var newPatient = new Patient
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsPortalEnabled = true,
                IsEmailVerified = false,
                EmailVerificationToken = verificationToken,
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24),
                CreatedAt = DateTime.UtcNow
            };
            patient = await _patientRepository.AddAsync(newPatient);
        }

        _ = _emailService.SendEmailVerificationAsync(
            dto.Email, $"{dto.FirstName} {dto.LastName}", verificationToken);

        return await GenerateAuthResponse(patient);
    }

    public async Task<AuthResponseDto> LoginAsync(PatientLoginDto dto)
    {
        var patient = await _patientRepository.GetByEmailAsync(dto.Email);

        if (patient == null || !patient.IsPortalEnabled || patient.PasswordHash == null)
            throw new KeyNotFoundException("Invalid credentials.");

        if (patient.LockoutEnd.HasValue && patient.LockoutEnd > DateTime.UtcNow)
        {
            var remaining = (int)Math.Ceiling((patient.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes);
            throw new InvalidOperationException($"Account is locked. Try again in {remaining} minute(s).");
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, patient.PasswordHash))
        {
            patient.FailedLoginAttempts++;
            if (patient.FailedLoginAttempts >= MaxFailedAttempts)
            {
                patient.LockoutEnd = DateTime.UtcNow.Add(LockoutDuration);
                patient.FailedLoginAttempts = 0;
                await _patientRepository.UpdateAsync(patient);
                throw new InvalidOperationException($"Account locked due to {MaxFailedAttempts} failed attempts. Try again in {LockoutDuration.TotalMinutes} minutes.");
            }
            await _patientRepository.UpdateAsync(patient);
            throw new KeyNotFoundException("Invalid credentials.");
        }

        patient.FailedLoginAttempts = 0;
        patient.LockoutEnd = null;

        return await GenerateAuthResponse(patient);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var patient = await _patientRepository.GetByRefreshTokenAsync(refreshToken);

        if (patient == null || !patient.IsPortalEnabled)
            throw new KeyNotFoundException("Invalid refresh token.");

        if (patient.RefreshTokenExpiry < DateTime.UtcNow)
        {
            patient.RefreshToken = null;
            patient.RefreshTokenExpiry = null;
            await _patientRepository.UpdateAsync(patient);
            throw new InvalidOperationException("Refresh token has expired. Please login again.");
        }

        return await GenerateAuthResponse(patient);
    }

    public async Task<PatientDto> GetProfileAsync(int patientId)
    {
        var patient = await _patientRepository.GetByIdAsync(patientId);
        if (patient == null)
            throw new KeyNotFoundException("Patient not found.");

        return MapToDto(patient);
    }

    public async Task<PatientDto> UpdateProfileAsync(int patientId, UpdatePortalProfileDto dto)
    {
        var patient = await _patientRepository.GetByIdAsync(patientId);
        if (patient == null)
            throw new KeyNotFoundException("Patient not found.");

        patient.FirstName = dto.FirstName;
        patient.LastName = dto.LastName;
        patient.Phone = dto.Phone;
        patient.Address = dto.Address;
        patient.UpdatedAt = DateTime.UtcNow;

        var updated = await _patientRepository.UpdateAsync(patient);
        return MapToDto(updated);
    }

    public async Task<PatientDto> UpdateNotificationPreferencesAsync(int patientId, UpdateNotificationPreferencesDto dto)
    {
        var patient = await _patientRepository.GetByIdAsync(patientId);
        if (patient == null)
            throw new KeyNotFoundException("Patient not found.");

        patient.EmailNotificationsEnabled = dto.EmailNotificationsEnabled;
        patient.SmsNotificationsEnabled = dto.SmsNotificationsEnabled;
        patient.UpdatedAt = DateTime.UtcNow;

        var updated = await _patientRepository.UpdateAsync(patient);
        return MapToDto(updated);
    }

    public async Task ForgotPasswordAsync(string email)
    {
        var patient = await _patientRepository.GetByEmailAsync(email);
        if (patient == null || !patient.IsPortalEnabled)
            return; // Don't reveal whether email exists

        var resetToken = GenerateRefreshToken();
        patient.PasswordResetToken = resetToken;
        patient.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _patientRepository.UpdateAsync(patient);

        await _emailService.SendPasswordResetAsync(
            email, $"{patient.FirstName} {patient.LastName}", resetToken);
    }

    public async Task ResetPasswordAsync(string token, string newPassword)
    {
        var patient = await _patientRepository.GetByPasswordResetTokenAsync(token);
        if (patient == null)
            throw new KeyNotFoundException("Invalid or expired reset token.");

        if (patient.PasswordResetTokenExpiry < DateTime.UtcNow)
        {
            patient.PasswordResetToken = null;
            patient.PasswordResetTokenExpiry = null;
            await _patientRepository.UpdateAsync(patient);
            throw new InvalidOperationException("Reset token has expired. Please request a new one.");
        }

        patient.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        patient.PasswordResetToken = null;
        patient.PasswordResetTokenExpiry = null;
        patient.UpdatedAt = DateTime.UtcNow;
        await _patientRepository.UpdateAsync(patient);
    }

    public async Task SendVerificationEmailAsync(int patientId)
    {
        var patient = await _patientRepository.GetByIdAsync(patientId);
        if (patient == null)
            throw new KeyNotFoundException("Patient not found.");

        if (patient.IsEmailVerified)
            throw new InvalidOperationException("Email is already verified.");

        var verificationToken = GenerateRefreshToken();
        patient.EmailVerificationToken = verificationToken;
        patient.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        await _patientRepository.UpdateAsync(patient);

        await _emailService.SendEmailVerificationAsync(
            patient.Email!, $"{patient.FirstName} {patient.LastName}", verificationToken);
    }

    public async Task VerifyEmailAsync(string token)
    {
        var patient = await _patientRepository.GetByEmailVerificationTokenAsync(token);
        if (patient == null)
            throw new KeyNotFoundException("Invalid verification token.");

        if (patient.EmailVerificationTokenExpiry < DateTime.UtcNow)
        {
            patient.EmailVerificationToken = null;
            patient.EmailVerificationTokenExpiry = null;
            await _patientRepository.UpdateAsync(patient);
            throw new InvalidOperationException("Verification token has expired. Please request a new one.");
        }

        patient.IsEmailVerified = true;
        patient.EmailVerificationToken = null;
        patient.EmailVerificationTokenExpiry = null;
        patient.UpdatedAt = DateTime.UtcNow;
        await _patientRepository.UpdateAsync(patient);
    }

    public async Task CancelAppointmentAsync(int patientId, int appointmentId)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);

        if (appointment == null || appointment.PatientId != patientId)
            throw new KeyNotFoundException("Appointment not found.");

        if (appointment.Status != AppointmentStatus.Pending)
            throw new InvalidOperationException("Only pending appointments can be cancelled.");

        appointment.Status = AppointmentStatus.Cancelled;
        appointment.UpdatedAt = DateTime.UtcNow;
        await _appointmentRepository.UpdateAsync(appointment);
    }

    private async Task<AuthResponseDto> GenerateAuthResponse(Patient patient)
    {
        var expiryHours = int.TryParse(_configuration["Jwt:ExpiryHours"], out var h) ? h : 8;
        var expiresAt = DateTime.UtcNow.AddHours(expiryHours);
        var token = GenerateJwtToken(patient, expiresAt);

        var refreshToken = GenerateRefreshToken();
        patient.RefreshToken = refreshToken;
        patient.RefreshTokenExpiry = DateTime.UtcNow.Add(RefreshTokenLifetime);
        await _patientRepository.UpdateAsync(patient);

        return new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            PatientId = patient.Id,
            FullName = $"{patient.FirstName} {patient.LastName}",
            Email = patient.Email ?? string.Empty
        };
    }

    private string GenerateJwtToken(Patient patient, DateTime expiresAt)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, patient.Id.ToString()),
            new Claim(ClaimTypes.Email, patient.Email ?? string.Empty),
            new Claim(ClaimTypes.Role, "patient")
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

    private static PatientDto MapToDto(Patient patient) => new()
    {
        Id = patient.Id,
        FirstName = patient.FirstName,
        LastName = patient.LastName,
        Phone = patient.Phone,
        Email = patient.Email,
        DateOfBirth = patient.DateOfBirth,
        Gender = patient.Gender,
        Address = patient.Address,
        MedicalHistory = patient.MedicalHistory,
        CreatedAt = patient.CreatedAt,
        EmailNotificationsEnabled = patient.EmailNotificationsEnabled,
        SmsNotificationsEnabled = patient.SmsNotificationsEnabled
    };
}
