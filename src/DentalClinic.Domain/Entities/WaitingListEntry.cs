namespace DentalClinic.Domain.Entities;

public class WaitingListEntry
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int TreatmentId { get; set; }
    public DateTime PreferredDate { get; set; }
    public TimeSpan? PreferredTime { get; set; }
    public bool IsNotified { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual Patient Patient { get; set; } = null!;
    public virtual Doctor Doctor { get; set; } = null!;
    public virtual Treatment Treatment { get; set; } = null!;
}
