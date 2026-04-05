using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly DentalClinicDbContext _context;

    public PaymentRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PaymentTransaction>> GetByInvoiceIdAsync(int invoiceId)
    {
        return await _context.PaymentTransactions
            .Include(p => p.Invoice)
            .Where(p => p.InvoiceId == invoiceId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<PaymentTransaction?> GetByIdAsync(int id)
    {
        return await _context.PaymentTransactions
            .Include(p => p.Invoice)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<PaymentTransaction> AddAsync(PaymentTransaction transaction)
    {
        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }

    public async Task<PaymentTransaction> UpdateAsync(PaymentTransaction transaction)
    {
        _context.PaymentTransactions.Update(transaction);
        await _context.SaveChangesAsync();
        return transaction;
    }
}
