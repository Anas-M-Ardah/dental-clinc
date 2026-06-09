using System.ComponentModel.DataAnnotations;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.DTOs;

public class DoctorDashboardDto
{
    public int TodayAppointmentCount { get; set; }
    public int UpcomingAppointmentCount { get; set; }
    public int PatientsSeenToday { get; set; }
    public int CompletedToday { get; set; }
    public List<AppointmentDto> TodaySchedule { get; set; } = new();
}

public class DoctorProfileDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Bio { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateDoctorProfileDto
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress, StringLength(100)]
    public string? Email { get; set; }

    [StringLength(2000)]
    public string? Bio { get; set; }
}

public class DoctorChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}

public class CompleteAppointmentDto
{
    [StringLength(2000)]
    public string? Notes { get; set; }
}

public class DoctorCreateTreatmentRecordDto
{
    [Required, Range(1, int.MaxValue)]
    public int PatientId { get; set; }
    public int? AppointmentId { get; set; }

    public DateTime VisitDate { get; set; } = DateTime.UtcNow;

    public string ChiefComplaint { get; set; } = string.Empty;
    public int PainLevel { get; set; }
    public string SymptomDuration { get; set; } = string.Empty;

    public string ExtraoralFindings { get; set; } = string.Empty;
    public string IntraoralFindings { get; set; } = string.Empty;
    public string TeethCondition { get; set; } = string.Empty;
    public string GumCondition { get; set; } = string.Empty;
    public string RadiographicFindings { get; set; } = string.Empty;

    public string PrimaryDiagnosis { get; set; } = string.Empty;
    public string SecondaryDiagnoses { get; set; } = string.Empty;

    public string TreatmentPlan { get; set; } = string.Empty;
    public string TreatmentStages { get; set; } = string.Empty;
    public decimal EstimatedCost { get; set; }

    public string ProcedurePerformed { get; set; } = string.Empty;
    public string AnaesthesiaUsed { get; set; } = string.Empty;
    public string MaterialsUsed { get; set; } = string.Empty;
    public string Complications { get; set; } = string.Empty;
    public int ProcedureDurationMinutes { get; set; }

    public string Prescriptions { get; set; } = string.Empty;
    public string PostTreatmentInstructions { get; set; } = string.Empty;

    public DateTime? NextAppointmentDate { get; set; }
    public int RecallPeriodDays { get; set; }

    public string Notes { get; set; } = string.Empty;
}
