using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface IDoctorService
{
    Task<IEnumerable<DoctorDto>> GetAllAsync();
    Task<DoctorDto?> GetByIdAsync(int id);
    Task<DoctorScheduleDto> GetScheduleAsync(int id, DateTime date);
}
