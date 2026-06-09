using System.Security.Claims;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/doctor-portal")]
[Authorize(Policy = "DoctorOnly")]
public class DoctorPortalController : ControllerBase
{
    private readonly IDoctorAuthService _authService;
    private readonly IAppointmentService _appointmentService;
    private readonly ITreatmentRecordService _treatmentRecordService;
    private readonly IDocumentService _documentService;
    private readonly IDoctorScheduleService _scheduleService;
    private readonly IReportService _reportService;
    private readonly DentalClinicDbContext _context;

    public DoctorPortalController(
        IDoctorAuthService authService,
        IAppointmentService appointmentService,
        ITreatmentRecordService treatmentRecordService,
        IDocumentService documentService,
        IDoctorScheduleService scheduleService,
        IReportService reportService,
        DentalClinicDbContext context)
    {
        _authService = authService;
        _appointmentService = appointmentService;
        _treatmentRecordService = treatmentRecordService;
        _documentService = documentService;
        _scheduleService = scheduleService;
        _reportService = reportService;
        _context = context;
    }

    private int GetDoctorId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<bool> HasSeenPatientAsync(int patientId)
    {
        var doctorId = GetDoctorId();
        return await _context.Appointments
            .AnyAsync(a => a.DoctorId == doctorId && a.PatientId == patientId);
    }

    // ---------- Profile ----------

    [HttpGet("profile")]
    public async Task<ActionResult<DoctorProfileDto>> GetProfile()
    {
        var profile = await _authService.GetProfileAsync(GetDoctorId());
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<DoctorProfileDto>> UpdateProfile([FromBody] UpdateDoctorProfileDto dto)
    {
        var updated = await _authService.UpdateProfileAsync(GetDoctorId(), dto);
        return Ok(updated);
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] DoctorChangePasswordDto dto)
    {
        await _authService.ChangePasswordAsync(GetDoctorId(), dto);
        return Ok(new { message = "Password changed successfully." });
    }

    // ---------- Dashboard ----------

    [HttpGet("dashboard")]
    public async Task<ActionResult<DoctorDashboardDto>> GetDashboard()
    {
        var doctorId = GetDoctorId();
        var today = DateTime.Today;

        var todayApptsPage = await _appointmentService.GetAllAsync(
            doctorId: doctorId, patientId: null, date: today, status: null,
            pageNumber: 1, pageSize: 100);

        var upcomingCount = await _context.Appointments
            .CountAsync(a => a.DoctorId == doctorId
                && a.AppointmentDate > today
                && a.Status != AppointmentStatus.Cancelled
                && a.Status != AppointmentStatus.Completed
                && a.Status != AppointmentStatus.NoShow);

        var completedToday = todayApptsPage.Data.Count(a => a.Status == AppointmentStatus.Completed);
        var patientsSeenToday = todayApptsPage.Data
            .Where(a => a.Status == AppointmentStatus.Completed || a.Status == AppointmentStatus.InProgress)
            .Select(a => a.PatientId)
            .Distinct()
            .Count();

        return Ok(new DoctorDashboardDto
        {
            TodayAppointmentCount = todayApptsPage.TotalCount,
            UpcomingAppointmentCount = upcomingCount,
            PatientsSeenToday = patientsSeenToday,
            CompletedToday = completedToday,
            TodaySchedule = todayApptsPage.Data.OrderBy(a => a.StartTime).ToList()
        });
    }

    // ---------- Appointments ----------

    [HttpGet("appointments")]
    public async Task<ActionResult<PagedResultDto<AppointmentDto>>> GetMyAppointments(
        [FromQuery] string? filter,
        [FromQuery] AppointmentStatus? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        var doctorId = GetDoctorId();
        var today = DateTime.Today;

        DateTime? date = null;
        DateTime? minDate = null;
        DateTime? maxDate = null;

        switch (filter?.ToLowerInvariant())
        {
            case "today": date = today; break;
            case "upcoming": minDate = today.AddDays(1); break;
            case "past": maxDate = today.AddDays(-1); break;
        }

        // For today filter we can use existing GetAllAsync with date; for upcoming/past we query inline.
        if (date.HasValue || (!minDate.HasValue && !maxDate.HasValue))
        {
            return Ok(await _appointmentService.GetAllAsync(
                doctorId: doctorId, patientId: null, date: date, status: status,
                pageNumber: pageNumber, pageSize: pageSize));
        }

        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.Treatment)
            .Where(a => a.DoctorId == doctorId);

        if (minDate.HasValue) query = query.Where(a => a.AppointmentDate >= minDate.Value);
        if (maxDate.HasValue) query = query.Where(a => a.AppointmentDate <= maxDate.Value);
        if (status.HasValue) query = query.Where(a => a.Status == status.Value);

        var total = await query.CountAsync();
        var orderedQuery = minDate.HasValue
            ? query.OrderBy(a => a.AppointmentDate).ThenBy(a => a.StartTime)
            : query.OrderByDescending(a => a.AppointmentDate).ThenByDescending(a => a.StartTime);

        var rows = await orderedQuery
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var data = rows.Select(a => new AppointmentDto
        {
            Id = a.Id,
            PatientId = a.PatientId,
            PatientName = $"{a.Patient.FirstName} {a.Patient.LastName}",
            DoctorId = a.DoctorId,
            DoctorName = $"Dr. {a.Doctor.FirstName} {a.Doctor.LastName}",
            AppointmentDate = a.AppointmentDate,
            StartTime = a.StartTime,
            EndTime = a.EndTime,
            TreatmentId = a.TreatmentId,
            TreatmentName = a.Treatment.Name,
            Notes = a.Notes,
            Status = a.Status,
            CreatedAt = a.CreatedAt
        }).ToList();

        return Ok(new PagedResultDto<AppointmentDto>
        {
            Data = data,
            TotalCount = total,
            PageNumber = pageNumber,
            PageSize = pageSize
        });
    }

    [HttpGet("appointments/{id}")]
    public async Task<ActionResult<AppointmentDto>> GetAppointment(int id)
    {
        var appt = await _appointmentService.GetByIdAsync(id);
        if (appt == null || appt.DoctorId != GetDoctorId()) return NotFound();
        return Ok(appt);
    }

    [HttpPatch("appointments/{id}/confirm")]
    public async Task<ActionResult<AppointmentDto>> ConfirmAppointment(int id)
    {
        var appt = await _appointmentService.GetByIdAsync(id);
        if (appt == null || appt.DoctorId != GetDoctorId()) return NotFound();
        var result = await _appointmentService.UpdateStatusAsync(id, AppointmentStatus.Confirmed);
        return Ok(result);
    }

    [HttpPatch("appointments/{id}/complete")]
    public async Task<ActionResult<AppointmentDto>> CompleteAppointment(int id, [FromBody] CompleteAppointmentDto? dto)
    {
        var appt = await _appointmentService.GetByIdAsync(id);
        if (appt == null || appt.DoctorId != GetDoctorId()) return NotFound();
        var result = await _appointmentService.UpdateStatusAsync(id, AppointmentStatus.Completed, dto?.Notes);
        return Ok(result);
    }

    [HttpPatch("appointments/{id}/no-show")]
    public async Task<ActionResult<AppointmentDto>> MarkNoShow(int id)
    {
        var appt = await _appointmentService.GetByIdAsync(id);
        if (appt == null || appt.DoctorId != GetDoctorId()) return NotFound();
        var result = await _appointmentService.UpdateStatusAsync(id, AppointmentStatus.NoShow);
        return Ok(result);
    }

    // ---------- Patients ----------

    [HttpGet("patients/{patientId}")]
    public async Task<ActionResult<FullMedicalHistoryDto>> GetPatient(int patientId)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();

        var patient = await _context.Patients.FindAsync(patientId);
        if (patient == null) return NotFound();

        var result = new FullMedicalHistoryDto
        {
            PatientId = patientId,
            PatientName = $"{patient.FirstName} {patient.LastName}",
            LegacyMedicalHistory = patient.MedicalHistory,
            Allergies = await _context.PatientAllergies.Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new PatientAllergyDto
                {
                    Id = a.Id, PatientId = a.PatientId, AllergyName = a.AllergyName,
                    Severity = a.Severity, Notes = a.Notes, CreatedAt = a.CreatedAt
                }).ToListAsync(),
            Medications = await _context.PatientMedications.Where(m => m.PatientId == patientId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new PatientMedicationDto
                {
                    Id = m.Id, PatientId = m.PatientId, MedicationName = m.MedicationName,
                    Dosage = m.Dosage, Frequency = m.Frequency, IsActive = m.IsActive,
                    Notes = m.Notes, CreatedAt = m.CreatedAt
                }).ToListAsync(),
            Conditions = await _context.PatientConditions.Where(c => c.PatientId == patientId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new PatientConditionDto
                {
                    Id = c.Id, PatientId = c.PatientId, ConditionName = c.ConditionName,
                    DiagnosedDate = c.DiagnosedDate, IsActive = c.IsActive,
                    Notes = c.Notes, CreatedAt = c.CreatedAt
                }).ToListAsync(),
            FamilyHistory = await _context.FamilyMedicalHistories.Where(f => f.PatientId == patientId)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FamilyMedicalHistoryDto
                {
                    Id = f.Id, PatientId = f.PatientId, Relationship = f.Relationship,
                    ConditionName = f.ConditionName, Notes = f.Notes, CreatedAt = f.CreatedAt
                }).ToListAsync()
        };

        return Ok(result);
    }

    [HttpGet("patients/{patientId}/profile")]
    public async Task<ActionResult<PatientDto>> GetPatientProfile(int patientId)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        var p = await _context.Patients.FindAsync(patientId);
        if (p == null) return NotFound();
        return Ok(new PatientDto
        {
            Id = p.Id, FirstName = p.FirstName, LastName = p.LastName,
            Email = p.Email, Phone = p.Phone, DateOfBirth = p.DateOfBirth,
            Gender = p.Gender, Address = p.Address, MedicalHistory = p.MedicalHistory,
            CreatedAt = p.CreatedAt
        });
    }

    // ---------- Treatment Records ----------

    [HttpGet("patients/{patientId}/treatment-records")]
    public async Task<ActionResult<IEnumerable<TreatmentRecordDto>>> GetTreatmentRecords(int patientId)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        var records = await _treatmentRecordService.GetByPatientAsync(patientId);
        return Ok(records);
    }

    [HttpPost("treatment-records")]
    public async Task<ActionResult<TreatmentRecordDto>> CreateTreatmentRecord([FromBody] DoctorCreateTreatmentRecordDto dto)
    {
        if (!await HasSeenPatientAsync(dto.PatientId)) return Forbid();

        var createDto = new CreateTreatmentRecordDto
        {
            PatientId = dto.PatientId,
            DoctorId = GetDoctorId(),
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
            Notes = dto.Notes
        };

        var created = await _treatmentRecordService.CreateAsync(createDto);
        return CreatedAtAction(nameof(GetTreatmentRecords), new { patientId = dto.PatientId }, created);
    }

    // ---------- Documents ----------

    [HttpGet("patients/{patientId}/documents")]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetPatientDocuments(int patientId)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        return Ok(await _documentService.GetByPatientIdAsync(patientId));
    }

    [HttpPost("patients/{patientId}/documents")]
    [RequestSizeLimit(50_000_000)] // 50 MB
    public async Task<ActionResult<DocumentDto>> UploadDocument(
        int patientId,
        IFormFile file,
        [FromForm] DocumentType type,
        [FromForm] int? treatmentRecordId,
        [FromForm] string? description)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

        var doctor = await _context.Doctors.FindAsync(GetDoctorId());
        var uploadedBy = doctor != null ? $"Dr. {doctor.FirstName} {doctor.LastName}" : "Doctor";

        using var stream = file.OpenReadStream();
        var dto = new UploadDocumentDto
        {
            PatientId = patientId,
            TreatmentRecordId = treatmentRecordId,
            Type = type,
            Description = description
        };

        var created = await _documentService.UploadAsync(dto, file.FileName, file.ContentType, file.Length, stream, uploadedBy);
        return Ok(created);
    }

    [HttpGet("documents/{id}/download")]
    public async Task<IActionResult> DownloadDocument(int id)
    {
        var doc = await _documentService.GetByIdAsync(id);
        if (doc == null) return NotFound();
        if (!await HasSeenPatientAsync(doc.PatientId)) return Forbid();

        var result = await _documentService.DownloadAsync(id);
        if (result == null) return NotFound();
        var (stream, contentType, fileName) = result.Value;
        return File(stream, contentType, fileName);
    }

    // ---------- Medical History writes ----------

    [HttpPost("patients/{patientId}/allergies")]
    public async Task<ActionResult<PatientAllergyDto>> AddAllergy(int patientId, [FromBody] CreatePatientAllergyDto dto)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        var entity = new PatientAllergy
        {
            PatientId = patientId, AllergyName = dto.AllergyName,
            Severity = dto.Severity, Notes = dto.Notes, CreatedAt = DateTime.UtcNow
        };
        _context.PatientAllergies.Add(entity);
        await _context.SaveChangesAsync();
        return Ok(new PatientAllergyDto
        {
            Id = entity.Id, PatientId = entity.PatientId, AllergyName = entity.AllergyName,
            Severity = entity.Severity, Notes = entity.Notes, CreatedAt = entity.CreatedAt
        });
    }

    [HttpDelete("patients/{patientId}/allergies/{id}")]
    public async Task<IActionResult> DeleteAllergy(int patientId, int id)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        var entity = await _context.PatientAllergies.FirstOrDefaultAsync(a => a.Id == id && a.PatientId == patientId);
        if (entity == null) return NotFound();
        _context.PatientAllergies.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("patients/{patientId}/medications")]
    public async Task<ActionResult<PatientMedicationDto>> AddMedication(int patientId, [FromBody] CreatePatientMedicationDto dto)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        var entity = new PatientMedication
        {
            PatientId = patientId, MedicationName = dto.MedicationName,
            Dosage = dto.Dosage, Frequency = dto.Frequency,
            IsActive = dto.IsActive, Notes = dto.Notes, CreatedAt = DateTime.UtcNow
        };
        _context.PatientMedications.Add(entity);
        await _context.SaveChangesAsync();
        return Ok(new PatientMedicationDto
        {
            Id = entity.Id, PatientId = entity.PatientId, MedicationName = entity.MedicationName,
            Dosage = entity.Dosage, Frequency = entity.Frequency, IsActive = entity.IsActive,
            Notes = entity.Notes, CreatedAt = entity.CreatedAt
        });
    }

    [HttpDelete("patients/{patientId}/medications/{id}")]
    public async Task<IActionResult> DeleteMedication(int patientId, int id)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        var entity = await _context.PatientMedications.FirstOrDefaultAsync(m => m.Id == id && m.PatientId == patientId);
        if (entity == null) return NotFound();
        _context.PatientMedications.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("patients/{patientId}/conditions")]
    public async Task<ActionResult<PatientConditionDto>> AddCondition(int patientId, [FromBody] CreatePatientConditionDto dto)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        var entity = new PatientCondition
        {
            PatientId = patientId, ConditionName = dto.ConditionName,
            DiagnosedDate = dto.DiagnosedDate, IsActive = dto.IsActive,
            Notes = dto.Notes, CreatedAt = DateTime.UtcNow
        };
        _context.PatientConditions.Add(entity);
        await _context.SaveChangesAsync();
        return Ok(new PatientConditionDto
        {
            Id = entity.Id, PatientId = entity.PatientId, ConditionName = entity.ConditionName,
            DiagnosedDate = entity.DiagnosedDate, IsActive = entity.IsActive,
            Notes = entity.Notes, CreatedAt = entity.CreatedAt
        });
    }

    [HttpDelete("patients/{patientId}/conditions/{id}")]
    public async Task<IActionResult> DeleteCondition(int patientId, int id)
    {
        if (!await HasSeenPatientAsync(patientId)) return Forbid();
        var entity = await _context.PatientConditions.FirstOrDefaultAsync(c => c.Id == id && c.PatientId == patientId);
        if (entity == null) return NotFound();
        _context.PatientConditions.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ---------- Schedule (Working Hours + Leaves) ----------

    [HttpGet("working-hours")]
    public async Task<ActionResult<IEnumerable<DoctorWorkingHoursDto>>> GetWorkingHours()
    {
        return Ok(await _scheduleService.GetWorkingHoursAsync(GetDoctorId()));
    }

    [HttpPut("working-hours")]
    public async Task<ActionResult<DoctorWorkingHoursDto>> UpsertWorkingHours([FromBody] UpsertWorkingHoursDto dto)
    {
        var result = await _scheduleService.UpsertWorkingHoursAsync(GetDoctorId(), dto);
        return Ok(result);
    }

    [HttpGet("leaves")]
    public async Task<ActionResult<IEnumerable<DoctorLeaveDto>>> GetLeaves()
    {
        return Ok(await _scheduleService.GetLeavesAsync(GetDoctorId()));
    }

    [HttpPost("leaves")]
    public async Task<ActionResult<DoctorLeaveDto>> AddLeave([FromBody] CreateDoctorLeaveDto dto)
    {
        var result = await _scheduleService.AddLeaveAsync(GetDoctorId(), dto);
        return Ok(result);
    }

    [HttpDelete("leaves/{id}")]
    public async Task<IActionResult> DeleteLeave(int id)
    {
        await _scheduleService.DeleteLeaveAsync(GetDoctorId(), id);
        return NoContent();
    }

    // ---------- Stats ----------

    [HttpGet("stats")]
    public async Task<ActionResult<DoctorPerformanceDto>> GetStats(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.Today.AddMonths(-1);
        var end = endDate ?? DateTime.Today;

        var all = await _reportService.GetDoctorPerformanceAsync(start, end);
        var mine = all.FirstOrDefault(d => d.DoctorId == GetDoctorId());

        if (mine == null)
        {
            var doctor = await _context.Doctors.FindAsync(GetDoctorId());
            return Ok(new DoctorPerformanceDto
            {
                DoctorId = GetDoctorId(),
                DoctorName = doctor != null ? $"Dr. {doctor.FirstName} {doctor.LastName}" : string.Empty,
                Specialization = doctor?.Specialization ?? string.Empty
            });
        }

        return Ok(mine);
    }
}
