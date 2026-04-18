namespace DentalClinic.Domain.Entities;

public class FamilyMedicalHistory
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string Relationship { get; set; } = string.Empty; // Father, Mother, Sibling, etc.
    public string ConditionName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual Patient Patient { get; set; } = null!;
}
