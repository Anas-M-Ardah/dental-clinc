using System.ComponentModel.DataAnnotations;

namespace DentalClinic.Application.DTOs;

public class PatientAllergyDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string AllergyName { get; set; } = string.Empty;
    public string? Severity { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePatientAllergyDto
{
    [Required, StringLength(200)]
    public string AllergyName { get; set; } = string.Empty;
    [StringLength(20)]
    public string? Severity { get; set; }
    [StringLength(500)]
    public string? Notes { get; set; }
}

public class PatientMedicationDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string? Dosage { get; set; }
    public string? Frequency { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePatientMedicationDto
{
    [Required, StringLength(200)]
    public string MedicationName { get; set; } = string.Empty;
    [StringLength(100)]
    public string? Dosage { get; set; }
    [StringLength(100)]
    public string? Frequency { get; set; }
    public bool IsActive { get; set; } = true;
    [StringLength(500)]
    public string? Notes { get; set; }
}

public class PatientConditionDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string ConditionName { get; set; } = string.Empty;
    public DateTime? DiagnosedDate { get; set; }
    public bool IsActive { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePatientConditionDto
{
    [Required, StringLength(200)]
    public string ConditionName { get; set; } = string.Empty;
    public DateTime? DiagnosedDate { get; set; }
    public bool IsActive { get; set; } = true;
    [StringLength(500)]
    public string? Notes { get; set; }
}

public class FamilyMedicalHistoryDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string Relationship { get; set; } = string.Empty;
    public string ConditionName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateFamilyMedicalHistoryDto
{
    [Required, StringLength(50)]
    public string Relationship { get; set; } = string.Empty;
    [Required, StringLength(200)]
    public string ConditionName { get; set; } = string.Empty;
    [StringLength(500)]
    public string? Notes { get; set; }
}

public class FullMedicalHistoryDto
{
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string? LegacyMedicalHistory { get; set; }
    public List<PatientAllergyDto> Allergies { get; set; } = new();
    public List<PatientMedicationDto> Medications { get; set; } = new();
    public List<PatientConditionDto> Conditions { get; set; } = new();
    public List<FamilyMedicalHistoryDto> FamilyHistory { get; set; } = new();
}
