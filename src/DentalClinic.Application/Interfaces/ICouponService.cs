using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface ICouponService
{
    Task<IEnumerable<CouponDto>> GetAllAsync();
    Task<CouponDto?> GetByIdAsync(int id);
    Task<CouponDto> CreateAsync(CreateCouponDto dto);
    Task<CouponDto> UpdateAsync(int id, CreateCouponDto dto);
    Task DeleteAsync(int id);
    Task<CouponValidationResult> ValidateAsync(string code, decimal invoiceAmount);
}
