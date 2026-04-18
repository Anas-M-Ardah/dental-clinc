namespace DentalClinic.Domain.Entities;

public class PatientAllergy
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string AllergyName { get; set; } = string.Empty;
    public string? Severity { get; set; } // Mild, Moderate, Severe
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual Patient Patient { get; set; } = null!;
}
