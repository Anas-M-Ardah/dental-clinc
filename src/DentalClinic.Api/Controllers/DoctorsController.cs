using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly IDoctorService _doctorService;

    public DoctorsController(IDoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DoctorDto>>> GetAll()
    {
        var doctors = await _doctorService.GetAllAsync();
        return Ok(doctors);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DoctorDto>> GetById(int id)
    {
        var doctor = await _doctorService.GetByIdAsync(id);
        if (doctor == null)
            return NotFound();
        return Ok(doctor);
    }

    [HttpGet("{id}/schedule")]
    public async Task<ActionResult<DoctorScheduleDto>> GetSchedule(int id, [FromQuery] DateTime? date)
    {
        var schedule = await _doctorService.GetScheduleAsync(id, date ?? DateTime.Today);
        return Ok(schedule);
    }
}
