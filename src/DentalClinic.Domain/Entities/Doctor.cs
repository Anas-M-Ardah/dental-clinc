namespace DentalClinic.Domain.Entities;

public class Doctor
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Bio { get; set; }
    public bool IsAvailable { get; set; } = true;
    public int MinAdvanceBookingHours { get; set; } = 24;
    public int MaxFutureBookingDays { get; set; } = 90;
    public DateTime CreatedAt { get; set; }

    // Authentication fields (Phase 10 - Doctor Portal)
    public string? PasswordHash { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockoutEnd { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public virtual ICollection<DoctorWorkingHours> WorkingHours { get; set; } = new List<DoctorWorkingHours>();
    public virtual ICollection<DoctorLeave> Leaves { get; set; } = new List<DoctorLeave>();
}
