namespace DentalClinic.Application.DTOs;

// Revenue
public class RevenueReportDto
{
    public decimal TotalRevenue { get; set; }
    public decimal AverageInvoiceAmount { get; set; }
    public int TotalInvoicesPaid { get; set; }
    public List<RevenuePeriodDto> ByPeriod { get; set; } = new();
    public List<RevenueByCategoryDto> ByDoctor { get; set; } = new();
    public List<RevenueByCategoryDto> ByTreatment { get; set; } = new();
}

public class RevenuePeriodDto
{
    public string Period { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int InvoiceCount { get; set; }
}

public class RevenueByCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Count { get; set; }
}

// Patients
public class PatientStatsDto
{
    public int TotalPatients { get; set; }
    public int NewPatientsThisMonth { get; set; }
    public int ActivePatients { get; set; }
    public int MaleCount { get; set; }
    public int FemaleCount { get; set; }
    public List<PatientAgeBracketDto> AgeBrackets { get; set; } = new();
    public List<NewPatientsTrendDto> MonthlyNewPatients { get; set; } = new();
}

public class PatientAgeBracketDto
{
    public string Bracket { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class NewPatientsTrendDto
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}

// Appointments
public class AppointmentAnalyticsDto
{
    public int TotalAppointments { get; set; }
    public int CompletedCount { get; set; }
    public int CancelledCount { get; set; }
    public int NoShowCount { get; set; }
    public decimal CompletionRate { get; set; }
    public decimal CancellationRate { get; set; }
    public decimal NoShowRate { get; set; }
    public List<AppointmentTrendDto> MonthlyTrend { get; set; } = new();
    public List<AppointmentsByStatusDto> ByStatus { get; set; } = new();
}

public class AppointmentTrendDto
{
    public string Month { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
}

public class AppointmentsByStatusDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

// Doctor performance
public class DoctorPerformanceDto
{
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public int AppointmentsCompleted { get; set; }
    public int AppointmentsCancelled { get; set; }
    public int NoShows { get; set; }
    public decimal Revenue { get; set; }
    public decimal CompletionRate { get; set; }
}

// Treatment popularity
public class TreatmentPopularityDto
{
    public int TreatmentId { get; set; }
    public string TreatmentName { get; set; } = string.Empty;
    public int AppointmentCount { get; set; }
    public int InvoiceItemCount { get; set; }
    public decimal TotalRevenue { get; set; }
}

// Monthly summary
public class MonthlySummaryDto
{
    public string Month { get; set; } = string.Empty;
    public int NewPatients { get; set; }
    public int TotalAppointments { get; set; }
    public int CompletedAppointments { get; set; }
    public int CancelledAppointments { get; set; }
    public decimal Revenue { get; set; }
    public int InvoicesCreated { get; set; }
    public int InvoicesPaid { get; set; }
}
