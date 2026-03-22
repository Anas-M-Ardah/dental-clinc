using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface ITreatmentService
{
    Task<IEnumerable<TreatmentDto>> GetAllAsync();
    Task<TreatmentDto?> GetByIdAsync(int id);
    Task<TreatmentDto> CreateAsync(CreateTreatmentDto dto);
    Task<TreatmentDto> UpdateAsync(int id, CreateTreatmentDto dto);
    Task DeleteAsync(int id);
}
