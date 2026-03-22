using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TreatmentsController : ControllerBase
{
    private readonly ITreatmentService _treatmentService;

    public TreatmentsController(ITreatmentService treatmentService)
    {
        _treatmentService = treatmentService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TreatmentDto>>> GetAll()
    {
        var treatments = await _treatmentService.GetAllAsync();
        return Ok(treatments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TreatmentDto>> GetById(int id)
    {
        var treatment = await _treatmentService.GetByIdAsync(id);
        if (treatment == null)
            return NotFound();
        return Ok(treatment);
    }

    [HttpPost]
    public async Task<ActionResult<TreatmentDto>> Create([FromBody] CreateTreatmentDto dto)
    {
        var created = await _treatmentService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TreatmentDto>> Update(int id, [FromBody] CreateTreatmentDto dto)
    {
        var updated = await _treatmentService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _treatmentService.DeleteAsync(id);
        return NoContent();
    }
}
