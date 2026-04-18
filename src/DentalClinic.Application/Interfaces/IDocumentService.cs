using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.Interfaces;

public interface IDocumentService
{
    Task<IEnumerable<DocumentDto>> GetByPatientIdAsync(int patientId);
    Task<IEnumerable<DocumentDto>> GetByTreatmentRecordIdAsync(int treatmentRecordId);
    Task<DocumentDto?> GetByIdAsync(int id);
    Task<DocumentDto> UploadAsync(UploadDocumentDto dto, string fileName, string contentType, long fileSize, Stream fileStream, string? uploadedBy = null);
    Task<(Stream FileStream, string ContentType, string FileName)?> DownloadAsync(int id);
    Task ArchiveAsync(int id);
    Task DeleteAsync(int id);
}
