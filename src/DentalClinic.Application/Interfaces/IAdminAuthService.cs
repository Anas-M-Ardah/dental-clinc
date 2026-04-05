using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface IAdminAuthService
{
    Task<AdminAuthResponseDto> LoginAsync(AdminLoginDto dto);
    Task<AdminAuthResponseDto> RefreshTokenAsync(string refreshToken);
}
