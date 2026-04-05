using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class TreatmentRecordsController : ControllerBase
{
    private readonly ITreatmentRecordService _service;

    public TreatmentRecordsController(ITreatmentRecordService service)
    {
        _service = service;
    }

    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<IEnumerable<TreatmentRecordDto>>> GetByPatient(int patientId)
    {
        var records = await _service.GetByPatientAsync(patientId);
        return Ok(records);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TreatmentRecordDto>> GetById(int id)
    {
        var record = await _service.GetByIdAsync(id);
        if (record == null)
            return NotFound();
        return Ok(record);
    }

    [HttpPost]
    public async Task<ActionResult<TreatmentRecordDto>> Create([FromBody] CreateTreatmentRecordDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TreatmentRecordDto>> Update(int id, [FromBody] UpdateTreatmentRecordDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
