using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Entities;
using DentalClinic.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/patients/{patientId}/medical-history")]
[Authorize(Policy = "AdminOnly")]
public class MedicalHistoryController : ControllerBase
{
    private readonly DentalClinicDbContext _context;

    public MedicalHistoryController(DentalClinicDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<FullMedicalHistoryDto>> GetFullHistory(int patientId)
    {
        var patient = await _context.Patients.FindAsync(patientId);
        if (patient == null) return NotFound();

        var result = new FullMedicalHistoryDto
        {
            PatientId = patientId,
            PatientName = $"{patient.FirstName} {patient.LastName}",
            LegacyMedicalHistory = patient.MedicalHistory,
            Allergies = await _context.PatientAllergies
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new PatientAllergyDto
                {
                    Id = a.Id, PatientId = a.PatientId,
                    AllergyName = a.AllergyName, Severity = a.Severity,
                    Notes = a.Notes, CreatedAt = a.CreatedAt
                }).ToListAsync(),
            Medications = await _context.PatientMedications
                .Where(m => m.PatientId == patientId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new PatientMedicationDto
                {
                    Id = m.Id, PatientId = m.PatientId,
                    MedicationName = m.MedicationName, Dosage = m.Dosage,
                    Frequency = m.Frequency, IsActive = m.IsActive,
                    Notes = m.Notes, CreatedAt = m.CreatedAt
                }).ToListAsync(),
            Conditions = await _context.PatientConditions
                .Where(c => c.PatientId == patientId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new PatientConditionDto
                {
                    Id = c.Id, PatientId = c.PatientId,
                    ConditionName = c.ConditionName, DiagnosedDate = c.DiagnosedDate,
                    IsActive = c.IsActive, Notes = c.Notes, CreatedAt = c.CreatedAt
                }).ToListAsync(),
            FamilyHistory = await _context.FamilyMedicalHistories
                .Where(f => f.PatientId == patientId)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FamilyMedicalHistoryDto
                {
                    Id = f.Id, PatientId = f.PatientId,
                    Relationship = f.Relationship, ConditionName = f.ConditionName,
                    Notes = f.Notes, CreatedAt = f.CreatedAt
                }).ToListAsync()
        };

        return Ok(result);
    }

    // Allergies
    [HttpPost("allergies")]
    public async Task<ActionResult<PatientAllergyDto>> AddAllergy(int patientId, [FromBody] CreatePatientAllergyDto dto)
    {
        if (!await _context.Patients.AnyAsync(p => p.Id == patientId)) return NotFound();

        var entity = new PatientAllergy
        {
            PatientId = patientId,
            AllergyName = dto.AllergyName,
            Severity = dto.Severity,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };
        _context.PatientAllergies.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFullHistory), new { patientId },
            new PatientAllergyDto
            {
                Id = entity.Id, PatientId = entity.PatientId,
                AllergyName = entity.AllergyName, Severity = entity.Severity,
                Notes = entity.Notes, CreatedAt = entity.CreatedAt
            });
    }

    [HttpDelete("allergies/{id}")]
    public async Task<IActionResult> DeleteAllergy(int patientId, int id)
    {
        var entity = await _context.PatientAllergies.FirstOrDefaultAsync(a => a.Id == id && a.PatientId == patientId);
        if (entity == null) return NotFound();
        _context.PatientAllergies.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Medications
    [HttpPost("medications")]
    public async Task<ActionResult<PatientMedicationDto>> AddMedication(int patientId, [FromBody] CreatePatientMedicationDto dto)
    {
        if (!await _context.Patients.AnyAsync(p => p.Id == patientId)) return NotFound();

        var entity = new PatientMedication
        {
            PatientId = patientId,
            MedicationName = dto.MedicationName,
            Dosage = dto.Dosage,
            Frequency = dto.Frequency,
            IsActive = dto.IsActive,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };
        _context.PatientMedications.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFullHistory), new { patientId },
            new PatientMedicationDto
            {
                Id = entity.Id, PatientId = entity.PatientId,
                MedicationName = entity.MedicationName, Dosage = entity.Dosage,
                Frequency = entity.Frequency, IsActive = entity.IsActive,
                Notes = entity.Notes, CreatedAt = entity.CreatedAt
            });
    }

    [HttpDelete("medications/{id}")]
    public async Task<IActionResult> DeleteMedication(int patientId, int id)
    {
        var entity = await _context.PatientMedications.FirstOrDefaultAsync(m => m.Id == id && m.PatientId == patientId);
        if (entity == null) return NotFound();
        _context.PatientMedications.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Conditions
    [HttpPost("conditions")]
    public async Task<ActionResult<PatientConditionDto>> AddCondition(int patientId, [FromBody] CreatePatientConditionDto dto)
    {
        if (!await _context.Patients.AnyAsync(p => p.Id == patientId)) return NotFound();

        var entity = new PatientCondition
        {
            PatientId = patientId,
            ConditionName = dto.ConditionName,
            DiagnosedDate = dto.DiagnosedDate,
            IsActive = dto.IsActive,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };
        _context.PatientConditions.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFullHistory), new { patientId },
            new PatientConditionDto
            {
                Id = entity.Id, PatientId = entity.PatientId,
                ConditionName = entity.ConditionName, DiagnosedDate = entity.DiagnosedDate,
                IsActive = entity.IsActive, Notes = entity.Notes, CreatedAt = entity.CreatedAt
            });
    }

    [HttpDelete("conditions/{id}")]
    public async Task<IActionResult> DeleteCondition(int patientId, int id)
    {
        var entity = await _context.PatientConditions.FirstOrDefaultAsync(c => c.Id == id && c.PatientId == patientId);
        if (entity == null) return NotFound();
        _context.PatientConditions.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Family History
    [HttpPost("family-history")]
    public async Task<ActionResult<FamilyMedicalHistoryDto>> AddFamilyHistory(int patientId, [FromBody] CreateFamilyMedicalHistoryDto dto)
    {
        if (!await _context.Patients.AnyAsync(p => p.Id == patientId)) return NotFound();

        var entity = new FamilyMedicalHistory
        {
            PatientId = patientId,
            Relationship = dto.Relationship,
            ConditionName = dto.ConditionName,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };
        _context.FamilyMedicalHistories.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFullHistory), new { patientId },
            new FamilyMedicalHistoryDto
            {
                Id = entity.Id, PatientId = entity.PatientId,
                Relationship = entity.Relationship, ConditionName = entity.ConditionName,
                Notes = entity.Notes, CreatedAt = entity.CreatedAt
            });
    }

    [HttpDelete("family-history/{id}")]
    public async Task<IActionResult> DeleteFamilyHistory(int patientId, int id)
    {
        var entity = await _context.FamilyMedicalHistories.FirstOrDefaultAsync(f => f.Id == id && f.PatientId == patientId);
        if (entity == null) return NotFound();
        _context.FamilyMedicalHistories.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
