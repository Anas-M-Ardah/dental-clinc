using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
    Task<TodayScheduleDto> GetTodayScheduleAsync();
    Task<IEnumerable<PatientDto>> GetRecentPatientsAsync(int count = 5);
}
