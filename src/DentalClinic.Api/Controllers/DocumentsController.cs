using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetByPatient(int patientId)
    {
        var docs = await _documentService.GetByPatientIdAsync(patientId);
        return Ok(docs);
    }

    [HttpGet("treatment-record/{treatmentRecordId}")]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetByTreatmentRecord(int treatmentRecordId)
    {
        var docs = await _documentService.GetByTreatmentRecordIdAsync(treatmentRecordId);
        return Ok(docs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDto>> GetById(int id)
    {
        var doc = await _documentService.GetByIdAsync(id);
        if (doc == null) return NotFound();
        return Ok(doc);
    }

    [HttpGet("{id}/download")]
    [AllowAnonymous]
    public async Task<IActionResult> Download(int id)
    {
        var result = await _documentService.DownloadAsync(id);
        if (result == null) return NotFound();

        var (stream, contentType, fileName) = result.Value;
        return File(stream, contentType, fileName);
    }

    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<DocumentDto>> Upload(
        [FromForm] int patientId,
        [FromForm] int? treatmentRecordId,
        [FromForm] DocumentType type,
        [FromForm] string? description,
        IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        var dto = new UploadDocumentDto
        {
            PatientId = patientId,
            TreatmentRecordId = treatmentRecordId,
            Type = type,
            Description = description
        };

        using var stream = file.OpenReadStream();
        var doc = await _documentService.UploadAsync(
            dto, file.FileName, file.ContentType, file.Length, stream, "Admin");

        return CreatedAtAction(nameof(GetById), new { id = doc.Id }, doc);
    }

    [HttpPatch("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        await _documentService.ArchiveAsync(id);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _documentService.DeleteAsync(id);
        return NoContent();
    }
}
