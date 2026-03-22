using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
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
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPatch("{id}/pay")]
    public async Task<ActionResult<InvoiceDto>> Pay(int id, [FromBody] PayInvoiceDto dto)
    {
        var updated = await _invoiceService.PayAsync(id, dto);
        return Ok(updated);
    }

    [HttpPatch("{id}/cancel")]
    public async Task<ActionResult<InvoiceDto>> Cancel(int id)
    {
        var updated = await _invoiceService.CancelAsync(id);
        return Ok(updated);
    }
}
