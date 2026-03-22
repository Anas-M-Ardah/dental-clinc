using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface ITreatmentRecordService
{
    Task<IEnumerable<TreatmentRecordDto>> GetByPatientAsync(int patientId);
    Task<TreatmentRecordDto?> GetByIdAsync(int id);
    Task<TreatmentRecordDto> CreateAsync(CreateTreatmentRecordDto dto);
    Task<TreatmentRecordDto> UpdateAsync(int id, UpdateTreatmentRecordDto dto);
    Task DeleteAsync(int id);
}
