using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DentalClinic.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CouponDto>>> GetAll()
    {
        var coupons = await _couponService.GetAllAsync();
        return Ok(coupons);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CouponDto>> GetById(int id)
    {
        var coupon = await _couponService.GetByIdAsync(id);
        if (coupon == null) return NotFound();
        return Ok(coupon);
    }

    [HttpPost]
    public async Task<ActionResult<CouponDto>> Create([FromBody] CreateCouponDto dto)
    {
        var created = await _couponService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CouponDto>> Update(int id, [FromBody] CreateCouponDto dto)
    {
        var updated = await _couponService.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _couponService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("validate")]
    public async Task<ActionResult<CouponValidationResult>> Validate([FromBody] ApplyCouponDto dto, [FromQuery] decimal amount)
    {
        var result = await _couponService.ValidateAsync(dto.CouponCode, amount);
        return Ok(result);
    }
}
