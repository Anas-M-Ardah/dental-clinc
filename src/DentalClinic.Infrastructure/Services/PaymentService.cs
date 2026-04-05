using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IInvoiceRepository _invoiceRepository;

    public PaymentService(IPaymentRepository paymentRepository, IInvoiceRepository invoiceRepository)
    {
        _paymentRepository = paymentRepository;
        _invoiceRepository = invoiceRepository;
    }

    public async Task<IEnumerable<PaymentTransactionDto>> GetByInvoiceIdAsync(int invoiceId)
    {
        var transactions = await _paymentRepository.GetByInvoiceIdAsync(invoiceId);
        return transactions.Select(MapToDto);
    }

    public async Task<PaymentTransactionDto> MakePaymentAsync(int invoiceId, MakePaymentDto dto)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
            throw new KeyNotFoundException("Invoice not found");

        if (invoice.Status == InvoiceStatus.Cancelled)
            throw new InvalidOperationException("Cannot make payment on a cancelled invoice");

        if (invoice.Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("Invoice is already fully paid");

        var balanceDue = invoice.TotalAmount - invoice.DiscountAmount - invoice.PaidAmount;
        if (dto.Amount > balanceDue)
            throw new InvalidOperationException($"Payment amount ({dto.Amount:F2}) exceeds balance due ({balanceDue:F2})");

        var transaction = new PaymentTransaction
        {
            InvoiceId = invoiceId,
            Amount = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            TransactionId = dto.TransactionId ?? $"TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
            Status = PaymentStatus.Completed,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(transaction);

        invoice.PaidAmount += dto.Amount;
        invoice.PaymentMethod = dto.PaymentMethod;

        if (invoice.PaidAmount >= invoice.TotalAmount - invoice.DiscountAmount)
        {
            invoice.Status = InvoiceStatus.Paid;
            invoice.PaidAt = DateTime.UtcNow;
        }
        else
        {
            invoice.Status = InvoiceStatus.PartiallyPaid;
        }

        await _invoiceRepository.UpdateAsync(invoice);

        return MapToDto(transaction);
    }

    public async Task<PaymentTransactionDto> RefundPaymentAsync(int invoiceId, RefundPaymentDto dto)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(invoiceId);
        if (invoice == null)
            throw new KeyNotFoundException("Invoice not found");

        if (invoice.PaidAmount <= 0)
            throw new InvalidOperationException("No payments to refund");

        if (dto.Amount > invoice.PaidAmount)
            throw new InvalidOperationException($"Refund amount ({dto.Amount:F2}) exceeds paid amount ({invoice.PaidAmount:F2})");

        var transaction = new PaymentTransaction
        {
            InvoiceId = invoiceId,
            Amount = -dto.Amount,
            PaymentMethod = "Refund",
            TransactionId = $"REF-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}",
            Status = PaymentStatus.Refunded,
            Notes = dto.Reason,
            CreatedAt = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(transaction);

        invoice.PaidAmount -= dto.Amount;

        if (invoice.PaidAmount <= 0)
        {
            invoice.Status = InvoiceStatus.Refunded;
            invoice.PaidAmount = 0;
        }
        else
        {
            invoice.Status = InvoiceStatus.PartiallyPaid;
        }

        await _invoiceRepository.UpdateAsync(invoice);

        return MapToDto(transaction);
    }

    private static PaymentTransactionDto MapToDto(PaymentTransaction t) => new()
    {
        Id = t.Id,
        InvoiceId = t.InvoiceId,
        InvoiceNumber = t.Invoice?.InvoiceNumber ?? string.Empty,
        Amount = t.Amount,
        PaymentMethod = t.PaymentMethod,
        TransactionId = t.TransactionId,
        GatewayResponse = t.GatewayResponse,
        Status = t.Status,
        Notes = t.Notes,
        CreatedAt = t.CreatedAt
    };
}
