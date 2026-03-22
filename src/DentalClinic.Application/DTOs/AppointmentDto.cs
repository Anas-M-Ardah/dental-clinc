using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.DTOs;

public class AppointmentDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int TreatmentId { get; set; }
    public string TreatmentName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public AppointmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateAppointmentDto
{
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public int TreatmentId { get; set; }
    public string? Notes { get; set; }
}

public class UpdateAppointmentDto
{
    public DateTime AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public int DoctorId { get; set; }
    public string? Notes { get; set; }
    public AppointmentStatus Status { get; set; }
}

public class AvailableSlotDto
{
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}

public class AvailableSlotsResponseDto
{
    public DateTime Date { get; set; }
    public int DoctorId { get; set; }
    public List<AvailableSlotDto> AvailableSlots { get; set; } = new();
}
