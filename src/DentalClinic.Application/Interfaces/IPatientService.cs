using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface IPatientService
{
    Task<PagedResultDto<PatientDto>> GetAllAsync(string? search, int pageNumber, int pageSize);
    Task<PatientDto?> GetByIdAsync(int id);
    Task<PatientDto> CreateAsync(CreatePatientDto dto);
    Task<PatientDto> UpdateAsync(int id, UpdatePatientDto dto);
    Task DeleteAsync(int id);
}
