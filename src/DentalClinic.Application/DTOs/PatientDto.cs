using System.ComponentModel.DataAnnotations;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.DTOs;

public class PatientDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string? Address { get; set; }
    public string? MedicalHistory { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool EmailNotificationsEnabled { get; set; }
    public bool SmsNotificationsEnabled { get; set; }
}

public class UpdateNotificationPreferencesDto
{
    public bool EmailNotificationsEnabled { get; set; }
    public bool SmsNotificationsEnabled { get; set; }
}

public class CreatePatientDto
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress, StringLength(100)]
    public string? Email { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    public Gender Gender { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    public string? MedicalHistory { get; set; }
}

public class UpdatePatientDto
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress, StringLength(100)]
    public string? Email { get; set; }

    [Required]
    public DateTime DateOfBirth { get; set; }

    public Gender Gender { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    public string? MedicalHistory { get; set; }
}
