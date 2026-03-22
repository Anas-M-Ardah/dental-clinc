using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.Interfaces;

public interface IAppointmentService
{
    Task<PagedResultDto<AppointmentDto>> GetAllAsync(int? doctorId, int? patientId, DateTime? date, AppointmentStatus? status, int pageNumber, int pageSize);
    Task<AppointmentDto?> GetByIdAsync(int id);
    Task<AvailableSlotsResponseDto> GetAvailableSlotsAsync(int doctorId, DateTime date);
    Task<AppointmentDto> CreateAsync(CreateAppointmentDto dto);
    Task<AppointmentDto> UpdateAsync(int id, UpdateAppointmentDto dto);
    Task DeleteAsync(int id);
}
