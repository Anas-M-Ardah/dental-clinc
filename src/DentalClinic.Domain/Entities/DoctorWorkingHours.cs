namespace DentalClinic.Domain.Entities;

public class DoctorWorkingHours
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int SlotDurationMinutes { get; set; } = 30;
    public int BufferMinutes { get; set; } = 0;
    public bool IsWorkingDay { get; set; } = true;

    public virtual Doctor Doctor { get; set; } = null!;
}
