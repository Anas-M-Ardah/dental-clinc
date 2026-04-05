using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface IPaymentService
{
    Task<IEnumerable<PaymentTransactionDto>> GetByInvoiceIdAsync(int invoiceId);
    Task<PaymentTransactionDto> MakePaymentAsync(int invoiceId, MakePaymentDto dto);
    Task<PaymentTransactionDto> RefundPaymentAsync(int invoiceId, RefundPaymentDto dto);
}
