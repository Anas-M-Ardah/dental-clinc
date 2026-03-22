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
    public InvoiceStatus Status { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public List<InvoiceItemDto> Items { get; set; } = new();
}

public class CreateInvoiceDto
{
    public int PatientId { get; set; }
    public int? AppointmentId { get; set; }
    public List<CreateInvoiceItemDto> Items { get; set; } = new();
}

public class CreateInvoiceItemDto
{
    public int TreatmentId { get; set; }
    public int Quantity { get; set; }
}

public class PayInvoiceDto
{
    public string? PaymentMethod { get; set; }
    public string? Notes { get; set; }
}
