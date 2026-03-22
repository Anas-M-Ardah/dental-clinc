namespace DentalClinic.Application.DTOs;

public class TreatmentRecordDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public int? AppointmentId { get; set; }
    
    public DateTime VisitDate { get; set; }
    
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
    
    public DateTime CreatedAt { get; set; }
}

public class CreateTreatmentRecordDto
{
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int? AppointmentId { get; set; }
    
    public DateTime VisitDate { get; set; }
    
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

public class UpdateTreatmentRecordDto
{
    public DateTime VisitDate { get; set; }
    
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
