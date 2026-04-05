using DentalClinic.Domain.Enums;

namespace DentalClinic.Domain.Entities;

public class PaymentTransaction
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public string? GatewayResponse { get; set; }
    public PaymentStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual Invoice Invoice { get; set; } = null!;
}
