namespace DentalClinic.Domain.Entities;

public class AuditLog
{
    public long Id { get; set; }
    public string Action { get; set; } = string.Empty; // Create, Update, Delete, Login, PasswordChange, etc.
    public string EntityType { get; set; } = string.Empty; // Patient, Appointment, Invoice, etc.
    public string? EntityId { get; set; }
    public string? UserId { get; set; }
    public string? UserRole { get; set; }
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; }
}
