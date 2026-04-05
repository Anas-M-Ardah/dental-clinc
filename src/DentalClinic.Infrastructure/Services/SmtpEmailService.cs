using System.Net;
using System.Net.Mail;
using DentalClinic.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DentalClinic.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        var senderEmail = _configuration["Email:SenderEmail"];
        var senderName = _configuration["Email:SenderName"] ?? "Dental Clinic";
        var password = _configuration["Email:Password"];
        var enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");

        if (string.IsNullOrEmpty(password))
        {
            _logger.LogWarning("Email password not configured. Skipping email to {ToEmail}: {Subject}", toEmail, subject);
            return;
        }

        using var client = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(senderEmail, password),
            EnableSsl = enableSsl
        };

        var message = new MailMessage
        {
            From = new MailAddress(senderEmail!, senderName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        message.To.Add(toEmail);

        try
        {
            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent to {ToEmail}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail}: {Subject}", toEmail, subject);
        }
    }

    public async Task SendAppointmentConfirmationAsync(string toEmail, string patientName, string doctorName, DateTime appointmentDate, TimeSpan startTime, string treatmentName)
    {
        var subject = "Appointment Confirmed - Dental Clinic";
        var body = WrapInTemplate($@"
            <h2>Appointment Confirmed</h2>
            <p>Dear {patientName},</p>
            <p>Your appointment has been successfully booked.</p>
            <table style=""width:100%;border-collapse:collapse;margin:20px 0;"">
                <tr><td style=""padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;"">Doctor</td><td style=""padding:8px 12px;border:1px solid #e2e8f0;"">Dr. {doctorName}</td></tr>
                <tr><td style=""padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;"">Date</td><td style=""padding:8px 12px;border:1px solid #e2e8f0;"">{appointmentDate:dddd, MMMM dd, yyyy}</td></tr>
                <tr><td style=""padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;"">Time</td><td style=""padding:8px 12px;border:1px solid #e2e8f0;"">{DateTime.Today.Add(startTime):hh:mm tt}</td></tr>
                <tr><td style=""padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;"">Treatment</td><td style=""padding:8px 12px;border:1px solid #e2e8f0;"">{treatmentName}</td></tr>
            </table>
            <p>Please arrive 10 minutes early. If you need to cancel, please do so at least 24 hours in advance through the patient portal.</p>");

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendInvoiceCreatedAsync(string toEmail, string patientName, string invoiceNumber, decimal totalAmount)
    {
        var subject = $"Invoice #{invoiceNumber} - Dental Clinic";
        var body = WrapInTemplate($@"
            <h2>New Invoice</h2>
            <p>Dear {patientName},</p>
            <p>A new invoice has been generated for you.</p>
            <div style=""background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0;text-align:center;"">
                <div style=""font-size:14px;color:#64748b;"">Invoice #{invoiceNumber}</div>
                <div style=""font-size:28px;font-weight:700;color:#0f172a;margin-top:8px;"">${totalAmount:N2}</div>
            </div>
            <p>You can view the full invoice details in your patient portal.</p>");

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendPaymentConfirmationAsync(string toEmail, string patientName, string invoiceNumber, decimal amountPaid)
    {
        var subject = $"Payment Received - Invoice #{invoiceNumber}";
        var body = WrapInTemplate($@"
            <h2>Payment Confirmed</h2>
            <p>Dear {patientName},</p>
            <p>We have received your payment. Thank you!</p>
            <div style=""background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;text-align:center;"">
                <div style=""font-size:14px;color:#166534;"">Invoice #{invoiceNumber}</div>
                <div style=""font-size:28px;font-weight:700;color:#166534;margin-top:8px;"">${amountPaid:N2}</div>
                <div style=""font-size:13px;color:#166534;margin-top:4px;"">Payment Received</div>
            </div>");

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendPasswordResetAsync(string toEmail, string patientName, string resetToken)
    {
        var resetUrl = $"http://localhost:4200/portal/reset-password?token={resetToken}";
        var subject = "Reset Your Password - Dental Clinic";
        var body = WrapInTemplate($@"
            <h2>Password Reset Request</h2>
            <p>Dear {patientName},</p>
            <p>We received a request to reset your password. Click the button below to set a new password.</p>
            <div style=""text-align:center;margin:30px 0;"">
                <a href=""{resetUrl}"" style=""display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;"">Reset Password</a>
            </div>
            <p style=""font-size:13px;color:#64748b;"">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>");

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendEmailVerificationAsync(string toEmail, string patientName, string verificationToken)
    {
        var verifyUrl = $"http://localhost:4200/portal/verify-email?token={verificationToken}";
        var subject = "Verify Your Email - Dental Clinic";
        var body = WrapInTemplate($@"
            <h2>Welcome to Dental Clinic!</h2>
            <p>Dear {patientName},</p>
            <p>Thank you for registering. Please verify your email address by clicking the button below.</p>
            <div style=""text-align:center;margin:30px 0;"">
                <a href=""{verifyUrl}"" style=""display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;"">Verify Email</a>
            </div>
            <p style=""font-size:13px;color:#64748b;"">This link expires in 24 hours.</p>");

        await SendEmailAsync(toEmail, subject, body);
    }

    private static string WrapInTemplate(string content)
    {
        return $@"<!DOCTYPE html>
<html>
<head><meta charset=""utf-8""></head>
<body style=""margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"">
  <div style=""max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);"">
    <div style=""background:linear-gradient(135deg,#0f172a,#1e293b);padding:24px 32px;text-align:center;"">
      <div style=""display:inline-flex;align-items:center;gap:10px;"">
        <div style=""width:36px;height:36px;background:linear-gradient(135deg,#818cf8,#6366f1);border-radius:8px;display:flex;align-items:center;justify-content:center;"">
          <span style=""color:#fff;font-size:18px;font-weight:700;"">&#x1F9B7;</span>
        </div>
        <span style=""color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.02em;"">Dental Clinic</span>
      </div>
    </div>
    <div style=""padding:32px;"">
      {content}
    </div>
    <div style=""background:#f8fafc;padding:16px 32px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;"">
      &copy; {DateTime.Now.Year} Dental Clinic. All rights reserved.
    </div>
  </div>
</body>
</html>";
    }
}
