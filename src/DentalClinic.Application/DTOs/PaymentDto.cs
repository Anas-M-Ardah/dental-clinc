using System.ComponentModel.DataAnnotations;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.DTOs;

public class PaymentTransactionDto
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public string? GatewayResponse { get; set; }
    public PaymentStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class MakePaymentDto
{
    [Required, Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
    public decimal Amount { get; set; }

    [Required, StringLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    [StringLength(100)]
    public string? TransactionId { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}

public class RefundPaymentDto
{
    [Required, Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
    public decimal Amount { get; set; }

    [StringLength(500)]
    public string? Reason { get; set; }
}

public class PortalPaymentDto
{
    [Required, Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required, StringLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;
}
