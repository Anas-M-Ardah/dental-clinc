using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var stats = await _dashboardService.GetStatsAsync();
        return Ok(stats);
    }

    [HttpGet("today-schedule")]
    public async Task<ActionResult<TodayScheduleDto>> GetTodaySchedule()
    {
        var schedule = await _dashboardService.GetTodayScheduleAsync();
        return Ok(schedule);
    }

    [HttpGet("recent-patients")]
    public async Task<ActionResult<IEnumerable<PatientDto>>> GetRecentPatients([FromQuery] int count = 5)
    {
        var patients = await _dashboardService.GetRecentPatientsAsync(count);
        return Ok(patients);
    }
}
