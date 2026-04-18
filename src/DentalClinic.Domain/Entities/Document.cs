using DentalClinic.Domain.Enums;

namespace DentalClinic.Domain.Entities;

public class Document
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int? TreatmentRecordId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DocumentType Type { get; set; }
    public string? Description { get; set; }
    public int Version { get; set; } = 1;
    public bool IsArchived { get; set; }
    public DateTime UploadedAt { get; set; }
    public string? UploadedBy { get; set; }

    public virtual Patient Patient { get; set; } = null!;
    public virtual TreatmentRecord? TreatmentRecord { get; set; }
}
