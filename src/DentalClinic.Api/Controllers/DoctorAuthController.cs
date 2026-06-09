using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/doctor-auth")]
[EnableRateLimiting("AuthRateLimit")]
public class DoctorAuthController : ControllerBase
{
    private readonly IDoctorAuthService _authService;

    public DoctorAuthController(IDoctorAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<DoctorAuthResponseDto>> Login([FromBody] DoctorLoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<DoctorAuthResponseDto>> Refresh([FromBody] RefreshTokenRequestDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto.RefreshToken);
        return Ok(result);
    }
}
