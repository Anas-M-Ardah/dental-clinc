namespace DentalClinic.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string htmlBody);
    Task SendAppointmentConfirmationAsync(string toEmail, string patientName, string doctorName, DateTime appointmentDate, TimeSpan startTime, string treatmentName);
    Task SendInvoiceCreatedAsync(string toEmail, string patientName, string invoiceNumber, decimal totalAmount);
    Task SendPaymentConfirmationAsync(string toEmail, string patientName, string invoiceNumber, decimal amountPaid);
    Task SendPasswordResetAsync(string toEmail, string patientName, string resetToken);
    Task SendEmailVerificationAsync(string toEmail, string patientName, string verificationToken);
}
