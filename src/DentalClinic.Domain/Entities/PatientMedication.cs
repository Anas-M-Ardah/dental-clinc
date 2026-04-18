namespace DentalClinic.Domain.Entities;

public class PatientMedication
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string? Dosage { get; set; }
    public string? Frequency { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual Patient Patient { get; set; } = null!;
}
