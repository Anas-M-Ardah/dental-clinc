using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Domain.Interfaces;

public interface IInvoiceRepository
{
    Task<IEnumerable<Invoice>> GetAllAsync();
    Task<Invoice?> GetByIdAsync(int id);
    Task<Invoice?> GetByIdWithItemsAsync(int id);
    Task<IEnumerable<Invoice>> GetByPatientAsync(int patientId);
    Task<IEnumerable<Invoice>> GetFilteredAsync(int? patientId, InvoiceStatus? status, DateTime? startDate, DateTime? endDate);
    Task<Invoice> AddAsync(Invoice invoice);
    Task<Invoice> UpdateAsync(Invoice invoice);
    Task<int> GetPendingCountAsync();
    Task<decimal> GetMonthlyRevenueAsync();
}
