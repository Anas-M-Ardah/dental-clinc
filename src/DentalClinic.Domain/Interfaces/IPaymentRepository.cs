using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface IPaymentRepository
{
    Task<IEnumerable<PaymentTransaction>> GetByInvoiceIdAsync(int invoiceId);
    Task<PaymentTransaction?> GetByIdAsync(int id);
    Task<PaymentTransaction> AddAsync(PaymentTransaction transaction);
    Task<PaymentTransaction> UpdateAsync(PaymentTransaction transaction);
}
