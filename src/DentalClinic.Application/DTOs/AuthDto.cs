using System.ComponentModel.DataAnnotations;
using DentalClinic.Application.Validation;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.DTOs;

public class PatientRegisterDto
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }

    public Gender Gender { get; set; }

    [Required, StrongPassword]
    public string Password { get; set; } = string.Empty;
}

public class PatientLoginDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int PatientId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class UpdatePortalProfileDto
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Address { get; set; }
}

public class ForgotPasswordDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required, StrongPassword]
    public string NewPassword { get; set; } = string.Empty;
}

public class VerifyEmailDto
{
    [Required]
    public string Token { get; set; } = string.Empty;
}

public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}

public class BookAppointmentDto
{
    [Required, Range(1, int.MaxValue)]
    public int DoctorId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [Required]
    public TimeSpan StartTime { get; set; }

    [Required, Range(1, int.MaxValue)]
    public int TreatmentId { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
