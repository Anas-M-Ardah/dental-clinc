using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Infrastructure.Services;

public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _documentRepository;
    private readonly string _storagePath;

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".pdf", ".doc", ".docx"
    };

    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    public DocumentService(IDocumentRepository documentRepository, string storagePath)
    {
        _documentRepository = documentRepository;
        _storagePath = storagePath;
        Directory.CreateDirectory(_storagePath);
    }

    public async Task<IEnumerable<DocumentDto>> GetByPatientIdAsync(int patientId)
    {
        var docs = await _documentRepository.GetByPatientIdAsync(patientId);
        return docs.Select(MapToDto);
    }

    public async Task<IEnumerable<DocumentDto>> GetByTreatmentRecordIdAsync(int treatmentRecordId)
    {
        var docs = await _documentRepository.GetByTreatmentRecordIdAsync(treatmentRecordId);
        return docs.Select(MapToDto);
    }

    public async Task<DocumentDto?> GetByIdAsync(int id)
    {
        var doc = await _documentRepository.GetByIdAsync(id);
        return doc == null ? null : MapToDto(doc);
    }

    public async Task<DocumentDto> UploadAsync(UploadDocumentDto dto, string fileName, string contentType, long fileSize, Stream fileStream, string? uploadedBy = null)
    {
        // Validate file type
        var extension = Path.GetExtension(fileName);
        if (!AllowedExtensions.Contains(extension))
            throw new InvalidOperationException($"File type '{extension}' is not allowed. Allowed: {string.Join(", ", AllowedExtensions)}");

        if (!AllowedContentTypes.Contains(contentType))
            throw new InvalidOperationException($"Content type '{contentType}' is not allowed.");

        // Validate file size
        if (fileSize > MaxFileSize)
            throw new InvalidOperationException($"File size exceeds the maximum of {MaxFileSize / 1024 / 1024} MB.");

        // Check for existing version
        var existingDocs = await _documentRepository.GetByPatientIdAsync(dto.PatientId);
        var sameNameDocs = existingDocs.Where(d => d.FileName == fileName && d.Type == dto.Type).ToList();
        var version = sameNameDocs.Count > 0 ? sameNameDocs.Max(d => d.Version) + 1 : 1;

        // Generate unique stored filename
        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(_storagePath, storedFileName);

        // Save file to disk
        using (var fs = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fs);
        }

        var document = new Document
        {
            PatientId = dto.PatientId,
            TreatmentRecordId = dto.TreatmentRecordId,
            FileName = fileName,
            StoredFileName = storedFileName,
            ContentType = contentType,
            FileSize = fileSize,
            Type = dto.Type,
            Description = dto.Description,
            Version = version,
            UploadedAt = DateTime.UtcNow,
            UploadedBy = uploadedBy
        };

        var created = await _documentRepository.AddAsync(document);
        return MapToDto(created);
    }

    public async Task<(Stream FileStream, string ContentType, string FileName)?> DownloadAsync(int id)
    {
        var doc = await _documentRepository.GetByIdAsync(id);
        if (doc == null) return null;

        var filePath = Path.Combine(_storagePath, doc.StoredFileName);
        if (!File.Exists(filePath)) return null;

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        return (stream, doc.ContentType, doc.FileName);
    }

    public async Task ArchiveAsync(int id)
    {
        var doc = await _documentRepository.GetByIdAsync(id);
        if (doc == null) throw new KeyNotFoundException("Document not found");

        doc.IsArchived = true;
        await _documentRepository.UpdateAsync(doc);
    }

    public async Task DeleteAsync(int id)
    {
        var doc = await _documentRepository.GetByIdAsync(id);
        if (doc != null)
        {
            var filePath = Path.Combine(_storagePath, doc.StoredFileName);
            if (File.Exists(filePath))
                File.Delete(filePath);

            await _documentRepository.DeleteAsync(id);
        }
    }

    private static DocumentDto MapToDto(Document d) => new()
    {
        Id = d.Id,
        PatientId = d.PatientId,
        PatientName = d.Patient != null ? $"{d.Patient.FirstName} {d.Patient.LastName}" : string.Empty,
        TreatmentRecordId = d.TreatmentRecordId,
        FileName = d.FileName,
        ContentType = d.ContentType,
        FileSize = d.FileSize,
        Type = d.Type,
        TypeName = d.Type.ToString(),
        Description = d.Description,
        Version = d.Version,
        IsArchived = d.IsArchived,
        UploadedAt = d.UploadedAt,
        UploadedBy = d.UploadedBy
    };
}
