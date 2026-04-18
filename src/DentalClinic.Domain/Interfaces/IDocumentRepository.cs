using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Domain.Interfaces;

public interface IDocumentRepository
{
    Task<IEnumerable<Document>> GetByPatientIdAsync(int patientId);
    Task<IEnumerable<Document>> GetByTreatmentRecordIdAsync(int treatmentRecordId);
    Task<Document?> GetByIdAsync(int id);
    Task<Document> AddAsync(Document document);
    Task<Document> UpdateAsync(Document document);
    Task DeleteAsync(int id);
}
