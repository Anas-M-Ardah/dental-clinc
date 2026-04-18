using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface IReportService
{
    Task<RevenueReportDto> GetRevenueReportAsync(DateTime startDate, DateTime endDate);
    Task<PatientStatsDto> GetPatientStatsAsync();
    Task<AppointmentAnalyticsDto> GetAppointmentAnalyticsAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<DoctorPerformanceDto>> GetDoctorPerformanceAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<TreatmentPopularityDto>> GetTreatmentPopularityAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<MonthlySummaryDto>> GetMonthlySummaryAsync(int months = 12);
}
