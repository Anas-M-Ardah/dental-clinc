namespace DentalClinic.Domain.Entities;

public class InvoiceItem
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int TreatmentId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    public virtual Invoice Invoice { get; set; } = null!;
    public virtual Treatment Treatment { get; set; } = null!;
}
