using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/admin-auth")]
public class AdminAuthController : ControllerBase
{
    private readonly IAdminAuthService _authService;

    public AdminAuthController(IAdminAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AdminAuthResponseDto>> Login([FromBody] AdminLoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AdminAuthResponseDto>> Refresh([FromBody] RefreshTokenRequestDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto.RefreshToken);
        return Ok(result);
    }
}
