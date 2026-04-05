using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface IPatientAuthService
{
    Task<AuthResponseDto> RegisterAsync(PatientRegisterDto dto);
    Task<AuthResponseDto> LoginAsync(PatientLoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task<PatientDto> GetProfileAsync(int patientId);
    Task<PatientDto> UpdateProfileAsync(int patientId, UpdatePortalProfileDto dto);
    Task<PatientDto> UpdateNotificationPreferencesAsync(int patientId, UpdateNotificationPreferencesDto dto);
    Task CancelAppointmentAsync(int patientId, int appointmentId);
    Task ForgotPasswordAsync(string email);
    Task ResetPasswordAsync(string token, string newPassword);
    Task SendVerificationEmailAsync(int patientId);
    Task VerifyEmailAsync(string token);
}
