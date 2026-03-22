using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;

    public AppointmentsController(IAppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<AppointmentDto>>> GetAll(
        [FromQuery] int? doctorId,
        [FromQuery] int? patientId,
        [FromQuery] DateTime? date,
        [FromQuery] AppointmentStatus? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _appointmentService.GetAllAsync(doctorId, patientId, date, status, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentDto>> GetById(int id)
    {
        var appointment = await _appointmentService.GetByIdAsync(id);
        if (appointment == null)
            return NotFound();
        return Ok(appointment);
    }

    [HttpGet("available-slots")]
    public async Task<ActionResult<AvailableSlotsResponseDto>> GetAvailableSlots(
        [FromQuery] int doctorId,
        [FromQuery] DateTime date)
    {
        var slots = await _appointmentService.GetAvailableSlotsAsync(doctorId, date);
        return Ok(slots);
    }

    [HttpPost]
    public async Task<ActionResult<AppointmentDto>> Create([FromBody] CreateAppointmentDto dto)
    {
        var created = await _appointmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AppointmentDto>> Update(int id, [FromBody] UpdateAppointmentDto dto)
    {
        var updated = await _appointmentService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _appointmentService.DeleteAsync(id);
        return NoContent();
    }
}
