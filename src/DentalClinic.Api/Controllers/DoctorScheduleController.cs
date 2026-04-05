using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/doctors/{doctorId}/schedule")]
[Authorize(Policy = "AdminOnly")]
public class DoctorScheduleController : ControllerBase
{
    private readonly IDoctorScheduleService _scheduleService;

    public DoctorScheduleController(IDoctorScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpGet("working-hours")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<DoctorWorkingHoursDto>>> GetWorkingHours(int doctorId)
    {
        var hours = await _scheduleService.GetWorkingHoursAsync(doctorId);
        return Ok(hours);
    }

    [HttpPut("working-hours")]
    public async Task<ActionResult<DoctorWorkingHoursDto>> UpsertWorkingHours(int doctorId, [FromBody] UpsertWorkingHoursDto dto)
    {
        var result = await _scheduleService.UpsertWorkingHoursAsync(doctorId, dto);
        return Ok(result);
    }

    [HttpGet("leaves")]
    public async Task<ActionResult<IEnumerable<DoctorLeaveDto>>> GetLeaves(int doctorId)
    {
        var leaves = await _scheduleService.GetLeavesAsync(doctorId);
        return Ok(leaves);
    }

    [HttpPost("leaves")]
    public async Task<ActionResult<DoctorLeaveDto>> AddLeave(int doctorId, [FromBody] CreateDoctorLeaveDto dto)
    {
        var result = await _scheduleService.AddLeaveAsync(doctorId, dto);
        return CreatedAtAction(nameof(GetLeaves), new { doctorId }, result);
    }

    [HttpDelete("leaves/{leaveId}")]
    public async Task<IActionResult> DeleteLeave(int doctorId, int leaveId)
    {
        await _scheduleService.DeleteLeaveAsync(doctorId, leaveId);
        return NoContent();
    }
}
