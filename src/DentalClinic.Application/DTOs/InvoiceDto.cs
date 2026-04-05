using System.ComponentModel.DataAnnotations;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.DTOs;

public class InvoiceItemDto
{
    public int Id { get; set; }
    public string TreatmentName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class InvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int? AppointmentId { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceDue { get; set; }
    public int? CouponId { get; set; }
    public string? CouponCode { get; set; }
    public InvoiceStatus Status { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? DueDate { get; set; }
    public List<InvoiceItemDto> Items { get; set; } = new();
    public List<PaymentTransactionDto> Payments { get; set; } = new();
}

public class CreateInvoiceDto
{
    [Required, Range(1, int.MaxValue)]
    public int PatientId { get; set; }

    public int? AppointmentId { get; set; }

    [StringLength(50)]
    public string? CouponCode { get; set; }

    public DateTime? DueDate { get; set; }

    [Required, MinLength(1)]
    public List<CreateInvoiceItemDto> Items { get; set; } = new();
}

public class CreateInvoiceItemDto
{
    [Required, Range(1, int.MaxValue)]
    public int TreatmentId { get; set; }

    [Required, Range(1, 100)]
    public int Quantity { get; set; }
}

public class PayInvoiceDto
{
    [StringLength(50)]
    public string? PaymentMethod { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
