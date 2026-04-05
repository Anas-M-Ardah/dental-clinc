using System.Security.Claims;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

    public PatientPortalController(
        IPatientAuthService authService,
        IAppointmentService appointmentService,
        IInvoiceService invoiceService,
        IPaymentService paymentService,
        ITreatmentRecordService treatmentRecordService,
        IEmailService emailService,
        INotificationService notificationService,
        IDoctorScheduleService scheduleService)
    {
        _authService = authService;
        _appointmentService = appointmentService;
        _invoiceService = invoiceService;
        _paymentService = paymentService;
        _treatmentRecordService = treatmentRecordService;
        _emailService = emailService;
        _notificationService = notificationService;
        _scheduleService = scheduleService;
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
