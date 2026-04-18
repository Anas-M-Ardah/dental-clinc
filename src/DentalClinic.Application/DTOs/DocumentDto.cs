using System.ComponentModel.DataAnnotations;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.DTOs;

public class DocumentDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int? TreatmentRecordId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DocumentType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Version { get; set; }
    public bool IsArchived { get; set; }
    public DateTime UploadedAt { get; set; }
    public string? UploadedBy { get; set; }
}

public class UploadDocumentDto
{
    [Required, Range(1, int.MaxValue)]
    public int PatientId { get; set; }

    public int? TreatmentRecordId { get; set; }

    [Required]
    public DocumentType Type { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }
}
