using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;

    public PatientsController(IPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<PatientDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _patientService.GetAllAsync(search, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PatientDto>> GetById(int id)
    {
        var patient = await _patientService.GetByIdAsync(id);
        if (patient == null)
            return NotFound();
        return Ok(patient);
    }

    [HttpPost]
    public async Task<ActionResult<PatientDto>> Create([FromBody] CreatePatientDto dto)
    {
        var created = await _patientService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PatientDto>> Update(int id, [FromBody] UpdatePatientDto dto)
    {
        var updated = await _patientService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _patientService.DeleteAsync(id);
        return NoContent();
    }
}
