namespace DentalClinic.Domain.Entities;

public class PatientSurvey
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int AppointmentId { get; set; }
    public int OverallRating { get; set; } // 1-5
    public int? StaffRating { get; set; } // 1-5
    public int? CleanlinessRating { get; set; } // 1-5
    public int? WaitTimeRating { get; set; } // 1-5
    public string? Comments { get; set; }
    public bool WouldRecommend { get; set; }
    public DateTime SubmittedAt { get; set; }

    public virtual Patient Patient { get; set; } = null!;
    public virtual Appointment Appointment { get; set; } = null!;
}
