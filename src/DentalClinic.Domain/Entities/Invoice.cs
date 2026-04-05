using DentalClinic.Domain.Enums;

namespace DentalClinic.Domain.Entities;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public int? AppointmentId { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public int? CouponId { get; set; }
    public InvoiceStatus Status { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? DueDate { get; set; }

    public virtual Patient Patient { get; set; } = null!;
    public virtual Appointment? Appointment { get; set; }
    public virtual Coupon? Coupon { get; set; }
    public virtual ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    public virtual ICollection<PaymentTransaction> Payments { get; set; } = new List<PaymentTransaction>();

    public decimal BalanceDue => TotalAmount - DiscountAmount - PaidAmount;
}
