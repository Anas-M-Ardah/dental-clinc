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
[Route("api/portal")]
[Authorize(Policy = "PatientOnly")]
public class PatientPortalController : ControllerBase
{
    private readonly IPatientAuthService _authService;
    private readonly IAppointmentService _appointmentService;
    private readonly IInvoiceService _invoiceService;
    private readonly IPaymentService _paymentService;
    private readonly ITreatmentRecordService _treatmentRecordService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly IDoctorScheduleService _scheduleService;
    private readonly IDocumentService _documentService;
    private readonly DentalClinicDbContext _context;

    public PatientPortalController(
        IPatientAuthService authService,
        IAppointmentService appointmentService,
        IInvoiceService invoiceService,
        IPaymentService paymentService,
        ITreatmentRecordService treatmentRecordService,
        IEmailService emailService,
        INotificationService notificationService,
        IDoctorScheduleService scheduleService,
        IDocumentService documentService,
        DentalClinicDbContext context)
    {
        _authService = authService;
        _appointmentService = appointmentService;
        _invoiceService = invoiceService;
        _paymentService = paymentService;
        _treatmentRecordService = treatmentRecordService;
        _emailService = emailService;
        _notificationService = notificationService;
        _scheduleService = scheduleService;
        _documentService = documentService;
        _context = context;
    }

    private int GetPatientId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("profile")]
    public async Task<ActionResult<PatientDto>> GetProfile()
    {
        var profile = await _authService.GetProfileAsync(GetPatientId());
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<PatientDto>> UpdateProfile([FromBody] UpdatePortalProfileDto dto)
    {
        var updated = await _authService.UpdateProfileAsync(GetPatientId(), dto);
        return Ok(updated);
    }

    [HttpPut("notification-preferences")]
    public async Task<ActionResult<PatientDto>> UpdateNotificationPreferences([FromBody] UpdateNotificationPreferencesDto dto)
    {
        var updated = await _authService.UpdateNotificationPreferencesAsync(GetPatientId(), dto);
        return Ok(updated);
    }

    [HttpGet("appointments")]
    public async Task<ActionResult<PagedResultDto<AppointmentDto>>> GetMyAppointments(
        [FromQuery] AppointmentStatus? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _appointmentService.GetAllAsync(
            doctorId: null,
            patientId: GetPatientId(),
            date: null,
            status: status,
            pageNumber: pageNumber,
            pageSize: pageSize);
        return Ok(result);
    }

    [HttpPost("appointments")]
    public async Task<ActionResult<AppointmentDto>> BookAppointment([FromBody] BookAppointmentDto dto)
    {
        var createDto = new CreateAppointmentDto
        {
            PatientId = GetPatientId(),
            DoctorId = dto.DoctorId,
            AppointmentDate = dto.AppointmentDate,
            StartTime = dto.StartTime,
            TreatmentId = dto.TreatmentId,
            Notes = dto.Notes
        };

        var result = await _appointmentService.CreateAsync(createDto);

        var profile = await _authService.GetProfileAsync(GetPatientId());
        if (!string.IsNullOrEmpty(profile.Email) && profile.EmailNotificationsEnabled)
        {
            _ = _emailService.SendAppointmentConfirmationAsync(
                profile.Email, $"{profile.FirstName} {profile.LastName}",
                result.DoctorName, result.AppointmentDate, result.StartTime, result.TreatmentName);
        }

        await _notificationService.CreateAsync(GetPatientId(),
            "Appointment Booked",
            $"Your appointment with Dr. {result.DoctorName} on {result.AppointmentDate:MMM dd, yyyy} at {DateTime.Today.Add(result.StartTime):hh:mm tt} has been confirmed.",
            "appointment");

        return CreatedAtAction(nameof(GetMyAppointments), result);
    }

    [HttpPatch("appointments/{id}/reschedule")]
    public async Task<ActionResult<AppointmentDto>> RescheduleAppointment(int id, [FromBody] RescheduleAppointmentDto dto)
    {
        // Verify the appointment belongs to the patient
        var appointment = await _appointmentService.GetByIdAsync(id);
        if (appointment == null || appointment.PatientId != GetPatientId())
            return NotFound();

        var result = await _appointmentService.RescheduleAsync(id, dto);

        await _notificationService.CreateAsync(GetPatientId(),
            "Appointment Rescheduled",
            $"Your appointment with {result.DoctorName} has been rescheduled to {result.AppointmentDate:MMM dd, yyyy} at {DateTime.Today.Add(result.StartTime):hh:mm tt}.",
            "appointment");

        return Ok(result);
    }

    [HttpDelete("appointments/{id}")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        await _authService.CancelAppointmentAsync(GetPatientId(), id);
        return NoContent();
    }

    // Waiting List
    [HttpGet("waiting-list")]
    public async Task<ActionResult<IEnumerable<WaitingListEntryDto>>> GetWaitingList()
    {
        var entries = await _scheduleService.GetPatientWaitingListAsync(GetPatientId());
        return Ok(entries);
    }

    [HttpPost("waiting-list")]
    public async Task<ActionResult<WaitingListEntryDto>> JoinWaitingList([FromBody] CreateWaitingListEntryDto dto)
    {
        var result = await _scheduleService.JoinWaitingListAsync(GetPatientId(), dto);
        return Ok(result);
    }

    [HttpDelete("waiting-list/{entryId}")]
    public async Task<IActionResult> LeaveWaitingList(int entryId)
    {
        await _scheduleService.LeaveWaitingListAsync(GetPatientId(), entryId);
        return NoContent();
    }

    [HttpGet("invoices/{id}")]
    public async Task<ActionResult<InvoiceDto>> GetMyInvoice(int id)
    {
        var invoice = await _invoiceService.GetByIdAsync(id);
        if (invoice == null || invoice.PatientId != GetPatientId())
            return NotFound();
        return Ok(invoice);
    }

    [HttpPost("invoices/{id}/pay")]
    public async Task<ActionResult<PaymentTransactionDto>> PayInvoice(int id, [FromBody] PortalPaymentDto dto)
    {
        var invoice = await _invoiceService.GetByIdAsync(id);
        if (invoice == null || invoice.PatientId != GetPatientId())
            return NotFound();

        var makePaymentDto = new MakePaymentDto
        {
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod
        };

        var transaction = await _paymentService.MakePaymentAsync(id, makePaymentDto);

        var profile = await _authService.GetProfileAsync(GetPatientId());
        if (!string.IsNullOrEmpty(profile.Email) && profile.EmailNotificationsEnabled)
        {
            _ = _emailService.SendPaymentConfirmationAsync(
                profile.Email, $"{profile.FirstName} {profile.LastName}",
                invoice.InvoiceNumber, dto.Amount);
        }

        await _notificationService.CreateAsync(GetPatientId(),
            "Payment Received",
            $"Your payment of {dto.Amount:F2} JOD for invoice {invoice.InvoiceNumber} has been processed.",
            "payment");

        return Ok(transaction);
    }

    [HttpGet("invoices")]
    public async Task<ActionResult<PagedResultDto<InvoiceDto>>> GetMyInvoices(
        [FromQuery] InvoiceStatus? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _invoiceService.GetAllAsync(
            patientId: GetPatientId(),
            status: status,
            startDate: null,
            endDate: null,
            pageNumber: pageNumber,
            pageSize: pageSize);
        return Ok(result);
    }

    [HttpGet("treatment-history")]
    public async Task<ActionResult<IEnumerable<TreatmentRecordDto>>> GetTreatmentHistory()
    {
        var records = await _treatmentRecordService.GetByPatientAsync(GetPatientId());
        return Ok(records);
    }

    // Documents
    [HttpGet("documents")]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetMyDocuments()
    {
        var docs = await _documentService.GetByPatientIdAsync(GetPatientId());
        return Ok(docs);
    }

    [HttpGet("documents/{id}/download")]
    public async Task<IActionResult> DownloadDocument(int id)
    {
        var doc = await _documentService.GetByIdAsync(id);
        if (doc == null || doc.PatientId != GetPatientId())
            return NotFound();

        var result = await _documentService.DownloadAsync(id);
        if (result == null) return NotFound();

        var (stream, contentType, fileName) = result.Value;
        return File(stream, contentType, fileName);
    }

    // Medical History
    [HttpGet("medical-history")]
    public async Task<ActionResult<FullMedicalHistoryDto>> GetMyMedicalHistory()
    {
        var patientId = GetPatientId();
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

    // Surveys
    [HttpGet("surveys")]
    public async Task<ActionResult<IEnumerable<PatientSurveyDto>>> GetMySurveys()
    {
        var surveys = await _context.PatientSurveys
            .Where(s => s.PatientId == GetPatientId())
            .Include(s => s.Appointment).ThenInclude(a => a.Doctor)
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new PatientSurveyDto
            {
                Id = s.Id, PatientId = s.PatientId, PatientName = "",
                AppointmentId = s.AppointmentId,
                DoctorName = s.Appointment.Doctor.FirstName + " " + s.Appointment.Doctor.LastName,
                AppointmentDate = s.Appointment.AppointmentDate,
                OverallRating = s.OverallRating, StaffRating = s.StaffRating,
                CleanlinessRating = s.CleanlinessRating, WaitTimeRating = s.WaitTimeRating,
                Comments = s.Comments, WouldRecommend = s.WouldRecommend,
                SubmittedAt = s.SubmittedAt
            }).ToListAsync();

        return Ok(surveys);
    }

    [HttpGet("surveys/pending")]
    public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetPendingSurveyAppointments()
    {
        var patientId = GetPatientId();
        var surveyedAppointmentIds = await _context.PatientSurveys
            .Where(s => s.PatientId == patientId)
            .Select(s => s.AppointmentId)
            .ToListAsync();

        var completedAppointments = await _context.Appointments
            .Include(a => a.Doctor).Include(a => a.Treatment)
            .Where(a => a.PatientId == patientId
                && a.Status == AppointmentStatus.Completed
                && !surveyedAppointmentIds.Contains(a.Id))
            .OrderByDescending(a => a.AppointmentDate)
            .Take(10)
            .ToListAsync();

        var dtos = completedAppointments.Select(a => new AppointmentDto
        {
            Id = a.Id, PatientId = a.PatientId, DoctorId = a.DoctorId,
            DoctorName = $"{a.Doctor.FirstName} {a.Doctor.LastName}",
            TreatmentName = a.Treatment?.Name ?? "",
            AppointmentDate = a.AppointmentDate, StartTime = a.StartTime,
            Status = a.Status
        });

        return Ok(dtos);
    }

    [HttpPost("surveys")]
    public async Task<ActionResult<PatientSurveyDto>> SubmitSurvey([FromBody] CreateSurveyDto dto)
    {
        var patientId = GetPatientId();

        var appointment = await _context.Appointments
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId && a.PatientId == patientId);
        if (appointment == null) return NotFound("Appointment not found.");
        if (appointment.Status != AppointmentStatus.Completed)
            return BadRequest("Survey can only be submitted for completed appointments.");

        var existing = await _context.PatientSurveys.AnyAsync(s => s.AppointmentId == dto.AppointmentId);
        if (existing) return BadRequest("Survey already submitted for this appointment.");

        var survey = new PatientSurvey
        {
            PatientId = patientId,
            AppointmentId = dto.AppointmentId,
            OverallRating = dto.OverallRating,
            StaffRating = dto.StaffRating,
            CleanlinessRating = dto.CleanlinessRating,
            WaitTimeRating = dto.WaitTimeRating,
            Comments = dto.Comments,
            WouldRecommend = dto.WouldRecommend,
            SubmittedAt = DateTime.UtcNow
        };

        _context.PatientSurveys.Add(survey);
        await _context.SaveChangesAsync();

        return Ok(new PatientSurveyDto
        {
            Id = survey.Id, PatientId = survey.PatientId, PatientName = "",
            AppointmentId = survey.AppointmentId,
            DoctorName = $"{appointment.Doctor.FirstName} {appointment.Doctor.LastName}",
            AppointmentDate = appointment.AppointmentDate,
            OverallRating = survey.OverallRating, StaffRating = survey.StaffRating,
            CleanlinessRating = survey.CleanlinessRating, WaitTimeRating = survey.WaitTimeRating,
            Comments = survey.Comments, WouldRecommend = survey.WouldRecommend,
            SubmittedAt = survey.SubmittedAt
        });
    }

    // Change Password
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var patient = await _context.Patients.FindAsync(GetPatientId());
        if (patient == null) return NotFound();

        if (string.IsNullOrEmpty(patient.PasswordHash) ||
            !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, patient.PasswordHash))
            return BadRequest("Current password is incorrect.");

        if (dto.NewPassword.Length < 8)
            return BadRequest("New password must be at least 8 characters.");

        patient.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        patient.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }

    [HttpGet("notifications")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotifications()
    {
        var notifications = await _notificationService.GetByPatientIdAsync(GetPatientId());
        return Ok(notifications);
    }

    [HttpGet("notifications/unread-count")]
    public async Task<ActionResult<UnreadCountDto>> GetUnreadCount()
    {
        var count = await _notificationService.GetUnreadCountAsync(GetPatientId());
        return Ok(new UnreadCountDto { Count = count });
    }

    [HttpPatch("notifications/{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        await _notificationService.MarkAsReadAsync(GetPatientId(), id);
        return NoContent();
    }

    [HttpPatch("notifications/read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(GetPatientId());
        return NoContent();
    }
}
