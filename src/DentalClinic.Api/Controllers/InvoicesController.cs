using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly IPaymentService _paymentService;
    private readonly IPatientAuthService _patientAuthService;
    private readonly IEmailService _emailService;

    public InvoicesController(
        IInvoiceService invoiceService,
        IPaymentService paymentService,
        IPatientAuthService patientAuthService,
        IEmailService emailService)
    {
        _invoiceService = invoiceService;
        _paymentService = paymentService;
        _patientAuthService = patientAuthService;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<InvoiceDto>>> GetAll(
        [FromQuery] int? patientId,
        [FromQuery] InvoiceStatus? status,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _invoiceService.GetAllAsync(patientId, status, startDate, endDate, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceDto>> GetById(int id)
    {
        var invoice = await _invoiceService.GetByIdAsync(id);
        if (invoice == null)
            return NotFound();
        return Ok(invoice);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> Create([FromBody] CreateInvoiceDto dto)
    {
        var created = await _invoiceService.CreateAsync(dto);

        try
        {
            var patient = await _patientAuthService.GetProfileAsync(dto.PatientId);
            if (!string.IsNullOrEmpty(patient.Email))
            {
                _ = _emailService.SendInvoiceCreatedAsync(
                    patient.Email, $"{patient.FirstName} {patient.LastName}",
                    created.InvoiceNumber, created.TotalAmount - created.DiscountAmount);
            }
        }
        catch { }

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id}/pay")]
    public async Task<ActionResult<InvoiceDto>> Pay(int id, [FromBody] PayInvoiceDto dto)
    {
        var updated = await _invoiceService.PayAsync(id, dto);

        try
        {
            var patient = await _patientAuthService.GetProfileAsync(updated.PatientId);
            if (!string.IsNullOrEmpty(patient.Email))
            {
                _ = _emailService.SendPaymentConfirmationAsync(
                    patient.Email, $"{patient.FirstName} {patient.LastName}",
                    updated.InvoiceNumber, updated.TotalAmount - updated.DiscountAmount);
            }
        }
        catch { }

        return Ok(updated);
    }

    [HttpPatch("{id}/cancel")]
    public async Task<ActionResult<InvoiceDto>> Cancel(int id)
    {
        var updated = await _invoiceService.CancelAsync(id);
        return Ok(updated);
    }

    // Partial payment
    [HttpPost("{id}/payments")]
    public async Task<ActionResult<PaymentTransactionDto>> MakePayment(int id, [FromBody] MakePaymentDto dto)
    {
        var transaction = await _paymentService.MakePaymentAsync(id, dto);

        try
        {
            var invoice = await _invoiceService.GetByIdAsync(id);
            if (invoice != null)
            {
                var patient = await _patientAuthService.GetProfileAsync(invoice.PatientId);
                if (!string.IsNullOrEmpty(patient.Email) && patient.EmailNotificationsEnabled)
                {
                    _ = _emailService.SendPaymentConfirmationAsync(
                        patient.Email, $"{patient.FirstName} {patient.LastName}",
                        invoice.InvoiceNumber, dto.Amount);
                }
            }
        }
        catch { }

        return Ok(transaction);
    }

    [HttpGet("{id}/payments")]
    public async Task<ActionResult<IEnumerable<PaymentTransactionDto>>> GetPayments(int id)
    {
        var transactions = await _paymentService.GetByInvoiceIdAsync(id);
        return Ok(transactions);
    }

    // Refund
    [HttpPost("{id}/refund")]
    public async Task<ActionResult<PaymentTransactionDto>> Refund(int id, [FromBody] RefundPaymentDto dto)
    {
        var transaction = await _paymentService.RefundPaymentAsync(id, dto);
        return Ok(transaction);
    }
}
