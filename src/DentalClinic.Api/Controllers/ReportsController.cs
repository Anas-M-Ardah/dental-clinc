using System.Text;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("revenue")]
    public async Task<ActionResult<RevenueReportDto>> GetRevenueReport(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
        var end = endDate ?? DateTime.UtcNow;
        var report = await _reportService.GetRevenueReportAsync(start, end);
        return Ok(report);
    }

    [HttpGet("patients")]
    public async Task<ActionResult<PatientStatsDto>> GetPatientStats()
    {
        var stats = await _reportService.GetPatientStatsAsync();
        return Ok(stats);
    }

    [HttpGet("appointments")]
    public async Task<ActionResult<AppointmentAnalyticsDto>> GetAppointmentAnalytics(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
        var end = endDate ?? DateTime.UtcNow;
        var analytics = await _reportService.GetAppointmentAnalyticsAsync(start, end);
        return Ok(analytics);
    }

    [HttpGet("doctors")]
    public async Task<ActionResult<IEnumerable<DoctorPerformanceDto>>> GetDoctorPerformance(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
        var end = endDate ?? DateTime.UtcNow;
        var performance = await _reportService.GetDoctorPerformanceAsync(start, end);
        return Ok(performance);
    }

    [HttpGet("treatments")]
    public async Task<ActionResult<IEnumerable<TreatmentPopularityDto>>> GetTreatmentPopularity(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
        var end = endDate ?? DateTime.UtcNow;
        var popularity = await _reportService.GetTreatmentPopularityAsync(start, end);
        return Ok(popularity);
    }

    [HttpGet("monthly-summary")]
    public async Task<ActionResult<IEnumerable<MonthlySummaryDto>>> GetMonthlySummary(
        [FromQuery] int months = 12)
    {
        var summary = await _reportService.GetMonthlySummaryAsync(months);
        return Ok(summary);
    }

    // CSV Exports
    [HttpGet("revenue/csv")]
    public async Task<IActionResult> ExportRevenueCsv(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
        var end = endDate ?? DateTime.UtcNow;
        var report = await _reportService.GetRevenueReportAsync(start, end);

        var sb = new StringBuilder();
        sb.AppendLine("Period,Revenue,Invoice Count");
        foreach (var p in report.ByPeriod)
            sb.AppendLine($"{p.Period},{p.Revenue:F2},{p.InvoiceCount}");
        sb.AppendLine();
        sb.AppendLine("Doctor,Revenue,Count");
        foreach (var d in report.ByDoctor)
            sb.AppendLine($"\"{d.Name}\",{d.Revenue:F2},{d.Count}");
        sb.AppendLine();
        sb.AppendLine("Treatment,Revenue,Count");
        foreach (var t in report.ByTreatment)
            sb.AppendLine($"\"{t.Name}\",{t.Revenue:F2},{t.Count}");

        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", $"revenue-report-{start:yyyyMMdd}-{end:yyyyMMdd}.csv");
    }

    [HttpGet("appointments/csv")]
    public async Task<IActionResult> ExportAppointmentsCsv(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
        var end = endDate ?? DateTime.UtcNow;
        var analytics = await _reportService.GetAppointmentAnalyticsAsync(start, end);

        var sb = new StringBuilder();
        sb.AppendLine("Month,Total,Completed,Cancelled");
        foreach (var m in analytics.MonthlyTrend)
            sb.AppendLine($"{m.Month},{m.Total},{m.Completed},{m.Cancelled}");
        sb.AppendLine();
        sb.AppendLine($"Completion Rate,{analytics.CompletionRate}%");
        sb.AppendLine($"Cancellation Rate,{analytics.CancellationRate}%");
        sb.AppendLine($"No-Show Rate,{analytics.NoShowRate}%");

        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", $"appointments-report-{start:yyyyMMdd}-{end:yyyyMMdd}.csv");
    }

    [HttpGet("doctors/csv")]
    public async Task<IActionResult> ExportDoctorsCsv(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
        var end = endDate ?? DateTime.UtcNow;
        var doctors = await _reportService.GetDoctorPerformanceAsync(start, end);

        var sb = new StringBuilder();
        sb.AppendLine("Doctor,Specialization,Completed,Cancelled,No Shows,Revenue,Completion Rate");
        foreach (var d in doctors)
            sb.AppendLine($"\"{d.DoctorName}\",\"{d.Specialization}\",{d.AppointmentsCompleted},{d.AppointmentsCancelled},{d.NoShows},{d.Revenue:F2},{d.CompletionRate}%");

        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", $"doctor-performance-{start:yyyyMMdd}-{end:yyyyMMdd}.csv");
    }

    [HttpGet("treatments/csv")]
    public async Task<IActionResult> ExportTreatmentsCsv(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-12);
        var end = endDate ?? DateTime.UtcNow;
        var treatments = await _reportService.GetTreatmentPopularityAsync(start, end);

        var sb = new StringBuilder();
        sb.AppendLine("Treatment,Appointments,Invoiced Quantity,Revenue");
        foreach (var t in treatments)
            sb.AppendLine($"\"{t.TreatmentName}\",{t.AppointmentCount},{t.InvoiceItemCount},{t.TotalRevenue:F2}");

        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", $"treatment-popularity-{start:yyyyMMdd}-{end:yyyyMMdd}.csv");
    }

    [HttpGet("monthly-summary/csv")]
    public async Task<IActionResult> ExportMonthlySummaryCsv([FromQuery] int months = 12)
    {
        var summary = await _reportService.GetMonthlySummaryAsync(months);

        var sb = new StringBuilder();
        sb.AppendLine("Month,New Patients,Total Appointments,Completed,Cancelled,Revenue,Invoices Created,Invoices Paid");
        foreach (var m in summary)
            sb.AppendLine($"{m.Month},{m.NewPatients},{m.TotalAppointments},{m.CompletedAppointments},{m.CancelledAppointments},{m.Revenue:F2},{m.InvoicesCreated},{m.InvoicesPaid}");

        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", "monthly-summary.csv");
    }
}
