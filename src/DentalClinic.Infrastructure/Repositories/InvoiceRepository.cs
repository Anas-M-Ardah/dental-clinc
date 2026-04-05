using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly DentalClinicDbContext _context;

    public InvoiceRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Invoice>> GetAllAsync()
    {
        return await _context.Invoices
            .Include(i => i.Patient)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<Invoice?> GetByIdAsync(int id)
    {
        return await _context.Invoices
            .Include(i => i.Patient)
            .Include(i => i.Coupon)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Invoice?> GetByIdWithItemsAsync(int id)
    {
        return await _context.Invoices
            .Include(i => i.Patient)
            .Include(i => i.Coupon)
            .Include(i => i.Items)
            .ThenInclude(item => item.Treatment)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<IEnumerable<Invoice>> GetByPatientAsync(int patientId)
    {
        return await _context.Invoices
            .Include(i => i.Coupon)
            .Include(i => i.Items)
            .ThenInclude(item => item.Treatment)
            .Include(i => i.Payments)
            .Where(i => i.PatientId == patientId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invoice>> GetFilteredAsync(int? patientId, InvoiceStatus? status, DateTime? startDate, DateTime? endDate)
    {
        var query = _context.Invoices
            .Include(i => i.Patient)
            .Include(i => i.Coupon)
            .Include(i => i.Items)
            .ThenInclude(item => item.Treatment)
            .Include(i => i.Payments)
            .AsQueryable();

        if (patientId.HasValue)
            query = query.Where(i => i.PatientId == patientId.Value);

        if (status.HasValue)
            query = query.Where(i => i.Status == status.Value);

        if (startDate.HasValue)
            query = query.Where(i => i.CreatedAt >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(i => i.CreatedAt <= endDate.Value);

        return await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
    }

    public async Task<Invoice> AddAsync(Invoice invoice)
    {
        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<Invoice> UpdateAsync(Invoice invoice)
    {
        _context.Invoices.Update(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<int> GetPendingCountAsync()
    {
        return await _context.Invoices
            .Where(i => i.Status == InvoiceStatus.Pending)
            .CountAsync();
    }

    public async Task<decimal> GetMonthlyRevenueAsync()
    {
        var startOfMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        return await _context.Invoices
            .Where(i => i.Status == InvoiceStatus.Paid && i.PaidAt >= startOfMonth)
            .SumAsync(i => i.TotalAmount);
    }

    public async Task<IEnumerable<Invoice>> GetOverdueInvoicesAsync()
    {
        var now = DateTime.UtcNow;
        return await _context.Invoices
            .Include(i => i.Patient)
            .Where(i => i.DueDate.HasValue
                && i.DueDate.Value < now
                && (i.Status == InvoiceStatus.Pending || i.Status == InvoiceStatus.PartiallyPaid))
            .OrderBy(i => i.DueDate)
            .ToListAsync();
    }
}
