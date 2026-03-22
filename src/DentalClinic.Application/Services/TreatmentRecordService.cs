using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Application.Services;

public class TreatmentRecordService : ITreatmentRecordService
{
    private readonly ITreatmentRecordRepository _repository;

    public TreatmentRecordService(ITreatmentRecordRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<TreatmentRecordDto>> GetByPatientAsync(int patientId)
    {
        var records = await _repository.GetByPatientAsync(patientId);
        return records.Select(MapToDto);
    }

    public async Task<TreatmentRecordDto?> GetByIdAsync(int id)
    {
        var record = await _repository.GetByIdWithDetailsAsync(id);
        return record == null ? null : MapToDto(record);
    }

    public async Task<TreatmentRecordDto> CreateAsync(CreateTreatmentRecordDto dto)
    {
        var record = new TreatmentRecord
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            AppointmentId = dto.AppointmentId,
            VisitDate = dto.VisitDate,
            ChiefComplaint = dto.ChiefComplaint,
            PainLevel = dto.PainLevel,
            SymptomDuration = dto.SymptomDuration,
            ExtraoralFindings = dto.ExtraoralFindings,
            IntraoralFindings = dto.IntraoralFindings,
            TeethCondition = dto.TeethCondition,
            GumCondition = dto.GumCondition,
            RadiographicFindings = dto.RadiographicFindings,
            PrimaryDiagnosis = dto.PrimaryDiagnosis,
            SecondaryDiagnoses = dto.SecondaryDiagnoses,
            TreatmentPlan = dto.TreatmentPlan,
            TreatmentStages = dto.TreatmentStages,
            EstimatedCost = dto.EstimatedCost,
            ProcedurePerformed = dto.ProcedurePerformed,
            AnaesthesiaUsed = dto.AnaesthesiaUsed,
            MaterialsUsed = dto.MaterialsUsed,
            Complications = dto.Complications,
            ProcedureDurationMinutes = dto.ProcedureDurationMinutes,
            Prescriptions = dto.Prescriptions,
            PostTreatmentInstructions = dto.PostTreatmentInstructions,
            NextAppointmentDate = dto.NextAppointmentDate,
            RecallPeriodDays = dto.RecallPeriodDays,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(record);
        return MapToDto(created);
    }

    public async Task<TreatmentRecordDto> UpdateAsync(int id, UpdateTreatmentRecordDto dto)
    {
        var record = await _repository.GetByIdAsync(id);
        if (record == null)
            throw new Exception("Treatment record not found");

        record.VisitDate = dto.VisitDate;
        record.ChiefComplaint = dto.ChiefComplaint;
        record.PainLevel = dto.PainLevel;
        record.SymptomDuration = dto.SymptomDuration;
        record.ExtraoralFindings = dto.ExtraoralFindings;
        record.IntraoralFindings = dto.IntraoralFindings;
        record.TeethCondition = dto.TeethCondition;
        record.GumCondition = dto.GumCondition;
        record.RadiographicFindings = dto.RadiographicFindings;
        record.PrimaryDiagnosis = dto.PrimaryDiagnosis;
        record.SecondaryDiagnoses = dto.SecondaryDiagnoses;
        record.TreatmentPlan = dto.TreatmentPlan;
        record.TreatmentStages = dto.TreatmentStages;
        record.EstimatedCost = dto.EstimatedCost;
        record.ProcedurePerformed = dto.ProcedurePerformed;
        record.AnaesthesiaUsed = dto.AnaesthesiaUsed;
        record.MaterialsUsed = dto.MaterialsUsed;
        record.Complications = dto.Complications;
        record.ProcedureDurationMinutes = dto.ProcedureDurationMinutes;
        record.Prescriptions = dto.Prescriptions;
        record.PostTreatmentInstructions = dto.PostTreatmentInstructions;
        record.NextAppointmentDate = dto.NextAppointmentDate;
        record.RecallPeriodDays = dto.RecallPeriodDays;
        record.Notes = dto.Notes;
        record.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(record);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }

    private static TreatmentRecordDto MapToDto(TreatmentRecord record)
    {
        return new TreatmentRecordDto
        {
            Id = record.Id,
            PatientId = record.PatientId,
            PatientName = $"{record.Patient.FirstName} {record.Patient.LastName}",
            DoctorId = record.DoctorId,
            DoctorName = $"Dr. {record.Doctor.FirstName} {record.Doctor.LastName}",
            AppointmentId = record.AppointmentId,
            VisitDate = record.VisitDate,
            ChiefComplaint = record.ChiefComplaint,
            PainLevel = record.PainLevel,
            SymptomDuration = record.SymptomDuration,
            ExtraoralFindings = record.ExtraoralFindings,
            IntraoralFindings = record.IntraoralFindings,
            TeethCondition = record.TeethCondition,
            GumCondition = record.GumCondition,
            RadiographicFindings = record.RadiographicFindings,
            PrimaryDiagnosis = record.PrimaryDiagnosis,
            SecondaryDiagnoses = record.SecondaryDiagnoses,
            TreatmentPlan = record.TreatmentPlan,
            TreatmentStages = record.TreatmentStages,
            EstimatedCost = record.EstimatedCost,
            ProcedurePerformed = record.ProcedurePerformed,
            AnaesthesiaUsed = record.AnaesthesiaUsed,
            MaterialsUsed = record.MaterialsUsed,
            Complications = record.Complications,
            ProcedureDurationMinutes = record.ProcedureDurationMinutes,
            Prescriptions = record.Prescriptions,
            PostTreatmentInstructions = record.PostTreatmentInstructions,
            NextAppointmentDate = record.NextAppointmentDate,
            RecallPeriodDays = record.RecallPeriodDays,
            Notes = record.Notes,
            CreatedAt = record.CreatedAt
        };
    }
}
