using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface ITreatmentRecordRepository
{
    Task<IEnumerable<TreatmentRecord>> GetByPatientAsync(int patientId);
    Task<TreatmentRecord?> GetByIdAsync(int id);
    Task<TreatmentRecord?> GetByIdWithDetailsAsync(int id);
    Task<TreatmentRecord> AddAsync(TreatmentRecord record);
    Task<TreatmentRecord> UpdateAsync(TreatmentRecord record);
    Task DeleteAsync(int id);
}
