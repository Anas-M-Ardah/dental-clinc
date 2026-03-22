namespace DentalClinic.Application.DTOs;

public class DashboardStatsDto
{
    public int TodayAppointments { get; set; }
    public int TotalPatients { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public int PendingInvoices { get; set; }
    public int CancelledToday { get; set; }
}

public class TodayScheduleDto
{
    public DateTime Date { get; set; }
    public List<AppointmentDto> Appointments { get; set; } = new();
}

public class PagedResultDto<T>
{
    public List<T> Data { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
