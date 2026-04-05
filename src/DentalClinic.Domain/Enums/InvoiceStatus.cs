namespace DentalClinic.Domain.Enums;

public enum InvoiceStatus
{
    Pending = 0,
    Paid = 1,
    Cancelled = 2,
    Refunded = 3,
    PartiallyPaid = 4,
    Overdue = 5
}
