using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Enums;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly DentalClinicDbContext _context;

    public ReportService(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<RevenueReportDto> GetRevenueReportAsync(DateTime startDate, DateTime endDate)
    {
        var paidInvoices = await _context.Invoices
            .Include(i => i.Items).ThenInclude(item => item.Treatment)
            .Include(i => i.Patient)
            .Where(i => i.Status == InvoiceStatus.Paid && i.PaidAt >= startDate && i.PaidAt <= endDate)
            .ToListAsync();

        var totalRevenue = paidInvoices.Sum(i => i.TotalAmount - i.DiscountAmount);

        // Revenue by month
        var byPeriod = paidInvoices
            .GroupBy(i => i.PaidAt!.Value.ToString("yyyy-MM"))
            .OrderBy(g => g.Key)
            .Select(g => new RevenuePeriodDto
            {
                Period = g.Key,
                Revenue = g.Sum(i => i.TotalAmount - i.DiscountAmount),
                InvoiceCount = g.Count()
            }).ToList();

        // Revenue by doctor (via appointment)
        var appointmentInvoices = paidInvoices.Where(i => i.AppointmentId.HasValue).ToList();
        var appointmentIds = appointmentInvoices.Select(i => i.AppointmentId!.Value).ToList();
        var appointments = await _context.Appointments
            .Include(a => a.Doctor)
            .Where(a => appointmentIds.Contains(a.Id))
            .ToDictionaryAsync(a => a.Id);

        var byDoctor = appointmentInvoices
            .Where(i => appointments.ContainsKey(i.AppointmentId!.Value))
            .GroupBy(i => appointments[i.AppointmentId!.Value].Doctor)
            .Select(g => new RevenueByCategoryDto
            {
                Name = $"Dr. {g.Key.FirstName} {g.Key.LastName}",
                Revenue = g.Sum(i => i.TotalAmount - i.DiscountAmount),
                Count = g.Count()
            })
            .OrderByDescending(x => x.Revenue)
            .ToList();

        // Revenue by treatment
        var byTreatment = paidInvoices
            .SelectMany(i => i.Items)
            .GroupBy(item => item.Treatment.Name)
            .Select(g => new RevenueByCategoryDto
            {
                Name = g.Key,
                Revenue = g.Sum(item => item.TotalPrice),
                Count = g.Sum(item => item.Quantity)
            })
            .OrderByDescending(x => x.Revenue)
            .ToList();

        return new RevenueReportDto
        {
            TotalRevenue = totalRevenue,
            AverageInvoiceAmount = paidInvoices.Count > 0 ? totalRevenue / paidInvoices.Count : 0,
            TotalInvoicesPaid = paidInvoices.Count,
            ByPeriod = byPeriod,
            ByDoctor = byDoctor,
            ByTreatment = byTreatment
        };
    }

    public async Task<PatientStatsDto> GetPatientStatsAsync()
    {
        var patients = await _context.Patients.ToListAsync();
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var sixMonthsAgo = now.AddMonths(-6);

        var activePatientIds = await _context.Appointments
            .Where(a => a.AppointmentDate >= sixMonthsAgo)
            .Select(a => a.PatientId)
            .Distinct()
            .CountAsync();

        var ageBrackets = patients
            .Select(p => (int)((now - p.DateOfBirth).TotalDays / 365.25))
            .GroupBy(age => age switch
            {
                < 18 => "0-17",
                < 30 => "18-29",
                < 45 => "30-44",
                < 60 => "45-59",
                _ => "60+"
            })
            .Select(g => new PatientAgeBracketDto { Bracket = g.Key, Count = g.Count() })
            .OrderBy(b => b.Bracket)
            .ToList();

        var monthlyNew = patients
            .Where(p => p.CreatedAt >= now.AddMonths(-12))
            .GroupBy(p => p.CreatedAt.ToString("yyyy-MM"))
            .OrderBy(g => g.Key)
            .Select(g => new NewPatientsTrendDto { Month = g.Key, Count = g.Count() })
            .ToList();

        return new PatientStatsDto
        {
            TotalPatients = patients.Count,
            NewPatientsThisMonth = patients.Count(p => p.CreatedAt >= startOfMonth),
            ActivePatients = activePatientIds,
            MaleCount = patients.Count(p => p.Gender == Gender.Male),
            FemaleCount = patients.Count(p => p.Gender == Gender.Female),
            AgeBrackets = ageBrackets,
            MonthlyNewPatients = monthlyNew
        };
    }

    public async Task<AppointmentAnalyticsDto> GetAppointmentAnalyticsAsync(DateTime startDate, DateTime endDate)
    {
        var appointments = await _context.Appointments
            .Where(a => a.AppointmentDate >= startDate && a.AppointmentDate <= endDate)
            .ToListAsync();

        var total = appointments.Count;
        var completed = appointments.Count(a => a.Status == AppointmentStatus.Completed);
        var cancelled = appointments.Count(a => a.Status == AppointmentStatus.Cancelled);
        var noShow = appointments.Count(a => a.Status == AppointmentStatus.NoShow);

        var monthlyTrend = appointments
            .GroupBy(a => a.AppointmentDate.ToString("yyyy-MM"))
            .OrderBy(g => g.Key)
            .Select(g => new AppointmentTrendDto
            {
                Month = g.Key,
                Total = g.Count(),
                Completed = g.Count(a => a.Status == AppointmentStatus.Completed),
                Cancelled = g.Count(a => a.Status == AppointmentStatus.Cancelled)
            }).ToList();

        var byStatus = Enum.GetValues<AppointmentStatus>()
            .Select(s => new AppointmentsByStatusDto
            {
                Status = s.ToString(),
                Count = appointments.Count(a => a.Status == s)
            })
            .Where(x => x.Count > 0)
            .ToList();

        return new AppointmentAnalyticsDto
        {
            TotalAppointments = total,
            CompletedCount = completed,
            CancelledCount = cancelled,
            NoShowCount = noShow,
            CompletionRate = total > 0 ? Math.Round((decimal)completed / total * 100, 1) : 0,
            CancellationRate = total > 0 ? Math.Round((decimal)cancelled / total * 100, 1) : 0,
            NoShowRate = total > 0 ? Math.Round((decimal)noShow / total * 100, 1) : 0,
            MonthlyTrend = monthlyTrend,
            ByStatus = byStatus
        };
    }

    public async Task<IEnumerable<DoctorPerformanceDto>> GetDoctorPerformanceAsync(DateTime startDate, DateTime endDate)
    {
        var doctors = await _context.Doctors.ToListAsync();
        var appointments = await _context.Appointments
            .Where(a => a.AppointmentDate >= startDate && a.AppointmentDate <= endDate)
            .ToListAsync();

        var paidInvoices = await _context.Invoices
            .Where(i => i.Status == InvoiceStatus.Paid && i.PaidAt >= startDate && i.PaidAt <= endDate && i.AppointmentId.HasValue)
            .ToListAsync();

        var appointmentsByDoctor = appointments.GroupBy(a => a.DoctorId).ToDictionary(g => g.Key, g => g.ToList());
        var invoicesByAppointment = paidInvoices.ToDictionary(i => i.AppointmentId!.Value);

        return doctors.Select(d =>
        {
            var docAppts = appointmentsByDoctor.GetValueOrDefault(d.Id, new List<Domain.Entities.Appointment>());
            var completedCount = docAppts.Count(a => a.Status == AppointmentStatus.Completed);
            var totalCount = docAppts.Count;
            var revenue = docAppts
                .Where(a => invoicesByAppointment.ContainsKey(a.Id))
                .Sum(a => invoicesByAppointment[a.Id].TotalAmount - invoicesByAppointment[a.Id].DiscountAmount);

            return new DoctorPerformanceDto
            {
                DoctorId = d.Id,
                DoctorName = $"Dr. {d.FirstName} {d.LastName}",
                Specialization = d.Specialization,
                AppointmentsCompleted = completedCount,
                AppointmentsCancelled = docAppts.Count(a => a.Status == AppointmentStatus.Cancelled),
                NoShows = docAppts.Count(a => a.Status == AppointmentStatus.NoShow),
                Revenue = revenue,
                CompletionRate = totalCount > 0 ? Math.Round((decimal)completedCount / totalCount * 100, 1) : 0
            };
        }).OrderByDescending(d => d.Revenue);
    }

    public async Task<IEnumerable<TreatmentPopularityDto>> GetTreatmentPopularityAsync(DateTime startDate, DateTime endDate)
    {
        var treatments = await _context.Treatments.ToListAsync();

        var appointmentCounts = await _context.Appointments
            .Where(a => a.AppointmentDate >= startDate && a.AppointmentDate <= endDate)
            .GroupBy(a => a.TreatmentId)
            .Select(g => new { TreatmentId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.TreatmentId, x => x.Count);

        var invoiceItems = await _context.InvoiceItems
            .Include(ii => ii.Invoice)
            .Where(ii => ii.Invoice.Status == InvoiceStatus.Paid && ii.Invoice.PaidAt >= startDate && ii.Invoice.PaidAt <= endDate)
            .ToListAsync();

        var itemsByTreatment = invoiceItems.GroupBy(ii => ii.TreatmentId).ToDictionary(g => g.Key, g => g.ToList());

        return treatments.Select(t => new TreatmentPopularityDto
        {
            TreatmentId = t.Id,
            TreatmentName = t.Name,
            AppointmentCount = appointmentCounts.GetValueOrDefault(t.Id, 0),
            InvoiceItemCount = itemsByTreatment.GetValueOrDefault(t.Id, new())?.Sum(ii => ii.Quantity) ?? 0,
            TotalRevenue = itemsByTreatment.GetValueOrDefault(t.Id, new())?.Sum(ii => ii.TotalPrice) ?? 0
        }).OrderByDescending(t => t.AppointmentCount);
    }

    public async Task<IEnumerable<MonthlySummaryDto>> GetMonthlySummaryAsync(int months = 12)
    {
        var startDate = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-months + 1);

        var patients = await _context.Patients
            .Where(p => p.CreatedAt >= startDate)
            .ToListAsync();

        var appointments = await _context.Appointments
            .Where(a => a.AppointmentDate >= startDate)
            .ToListAsync();

        var invoices = await _context.Invoices
            .Where(i => i.CreatedAt >= startDate)
            .ToListAsync();

        var result = new List<MonthlySummaryDto>();
        for (int i = 0; i < months; i++)
        {
            var monthStart = startDate.AddMonths(i);
            var monthEnd = monthStart.AddMonths(1);
            var monthKey = monthStart.ToString("yyyy-MM");

            var monthAppts = appointments.Where(a => a.AppointmentDate >= monthStart && a.AppointmentDate < monthEnd).ToList();
            var monthInvoices = invoices.Where(inv => inv.CreatedAt >= monthStart && inv.CreatedAt < monthEnd).ToList();
            var monthPaid = invoices.Where(inv => inv.Status == InvoiceStatus.Paid && inv.PaidAt >= monthStart && inv.PaidAt < monthEnd).ToList();

            result.Add(new MonthlySummaryDto
            {
                Month = monthKey,
                NewPatients = patients.Count(p => p.CreatedAt >= monthStart && p.CreatedAt < monthEnd),
                TotalAppointments = monthAppts.Count,
                CompletedAppointments = monthAppts.Count(a => a.Status == AppointmentStatus.Completed),
                CancelledAppointments = monthAppts.Count(a => a.Status == AppointmentStatus.Cancelled),
                Revenue = monthPaid.Sum(inv => inv.TotalAmount - inv.DiscountAmount),
                InvoicesCreated = monthInvoices.Count,
                InvoicesPaid = monthPaid.Count
            });
        }

        return result;
    }
}
