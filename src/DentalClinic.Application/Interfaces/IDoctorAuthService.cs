using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface IDoctorAuthService
{
    Task<DoctorAuthResponseDto> LoginAsync(DoctorLoginDto dto);
    Task<DoctorAuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task<DoctorProfileDto> GetProfileAsync(int doctorId);
    Task<DoctorProfileDto> UpdateProfileAsync(int doctorId, UpdateDoctorProfileDto dto);
    Task ChangePasswordAsync(int doctorId, DoctorChangePasswordDto dto);
}
