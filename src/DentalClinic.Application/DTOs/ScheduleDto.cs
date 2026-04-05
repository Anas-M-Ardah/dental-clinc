using System.ComponentModel.DataAnnotations;

namespace DentalClinic.Application.DTOs;

public class DoctorWorkingHoursDto
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public string DayName => DayOfWeek.ToString();
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int SlotDurationMinutes { get; set; }
    public int BufferMinutes { get; set; }
    public bool IsWorkingDay { get; set; }
}

public class UpsertWorkingHoursDto
{
    [Required]
    public DayOfWeek DayOfWeek { get; set; }

    [Required]
    public TimeSpan StartTime { get; set; }

    [Required]
    public TimeSpan EndTime { get; set; }

    [Range(10, 120)]
    public int SlotDurationMinutes { get; set; } = 30;

    [Range(0, 60)]
    public int BufferMinutes { get; set; } = 0;

    public bool IsWorkingDay { get; set; } = true;
}

public class DoctorLeaveDto
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateDoctorLeaveDto
{
    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [StringLength(500)]
    public string? Reason { get; set; }
}

public class WaitingListEntryDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public int TreatmentId { get; set; }
    public string TreatmentName { get; set; } = string.Empty;
    public DateTime PreferredDate { get; set; }
    public TimeSpan? PreferredTime { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateWaitingListEntryDto
{
    [Required, Range(1, int.MaxValue)]
    public int DoctorId { get; set; }

    [Required, Range(1, int.MaxValue)]
    public int TreatmentId { get; set; }

    [Required]
    public DateTime PreferredDate { get; set; }

    public TimeSpan? PreferredTime { get; set; }
}

public class RescheduleAppointmentDto
{
    [Required]
    public DateTime NewDate { get; set; }

    [Required]
    public TimeSpan NewStartTime { get; set; }
}
