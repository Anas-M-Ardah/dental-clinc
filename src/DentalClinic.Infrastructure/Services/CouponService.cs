using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Infrastructure.Services;

public class CouponService : ICouponService
{
    private readonly ICouponRepository _couponRepository;

    public CouponService(ICouponRepository couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<IEnumerable<CouponDto>> GetAllAsync()
    {
        var coupons = await _couponRepository.GetAllAsync();
        return coupons.Select(MapToDto);
    }

    public async Task<CouponDto?> GetByIdAsync(int id)
    {
        var coupon = await _couponRepository.GetByIdAsync(id);
        return coupon == null ? null : MapToDto(coupon);
    }

    public async Task<CouponDto> CreateAsync(CreateCouponDto dto)
    {
        var existing = await _couponRepository.GetByCodeAsync(dto.Code.ToUpper());
        if (existing != null)
            throw new InvalidOperationException($"Coupon with code '{dto.Code}' already exists");

        if (dto.IsPercentage && dto.DiscountValue > 100)
            throw new InvalidOperationException("Percentage discount cannot exceed 100%");

        var coupon = new Coupon
        {
            Code = dto.Code.ToUpper(),
            Description = dto.Description,
            IsPercentage = dto.IsPercentage,
            DiscountValue = dto.DiscountValue,
            MaxDiscountAmount = dto.MaxDiscountAmount,
            MinInvoiceAmount = dto.MinInvoiceAmount,
            MaxUsageCount = dto.MaxUsageCount,
            IsActive = true,
            ExpiresAt = dto.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _couponRepository.AddAsync(coupon);
        return MapToDto(created);
    }

    public async Task<CouponDto> UpdateAsync(int id, CreateCouponDto dto)
    {
        var coupon = await _couponRepository.GetByIdAsync(id);
        if (coupon == null)
            throw new KeyNotFoundException("Coupon not found");

        if (dto.IsPercentage && dto.DiscountValue > 100)
            throw new InvalidOperationException("Percentage discount cannot exceed 100%");

        var existingWithCode = await _couponRepository.GetByCodeAsync(dto.Code.ToUpper());
        if (existingWithCode != null && existingWithCode.Id != id)
            throw new InvalidOperationException($"Coupon with code '{dto.Code}' already exists");

        coupon.Code = dto.Code.ToUpper();
        coupon.Description = dto.Description;
        coupon.IsPercentage = dto.IsPercentage;
        coupon.DiscountValue = dto.DiscountValue;
        coupon.MaxDiscountAmount = dto.MaxDiscountAmount;
        coupon.MinInvoiceAmount = dto.MinInvoiceAmount;
        coupon.MaxUsageCount = dto.MaxUsageCount;
        coupon.ExpiresAt = dto.ExpiresAt;

        var updated = await _couponRepository.UpdateAsync(coupon);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        await _couponRepository.DeleteAsync(id);
    }

    public async Task<CouponValidationResult> ValidateAsync(string code, decimal invoiceAmount)
    {
        var coupon = await _couponRepository.GetByCodeAsync(code.ToUpper());

        if (coupon == null)
            return new CouponValidationResult { IsValid = false, ErrorMessage = "Coupon not found" };

        if (!coupon.IsActive)
            return new CouponValidationResult { IsValid = false, ErrorMessage = "Coupon is inactive" };

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt.Value < DateTime.UtcNow)
            return new CouponValidationResult { IsValid = false, ErrorMessage = "Coupon has expired" };

        if (coupon.MaxUsageCount.HasValue && coupon.CurrentUsageCount >= coupon.MaxUsageCount.Value)
            return new CouponValidationResult { IsValid = false, ErrorMessage = "Coupon usage limit reached" };

        if (coupon.MinInvoiceAmount.HasValue && invoiceAmount < coupon.MinInvoiceAmount.Value)
            return new CouponValidationResult { IsValid = false, ErrorMessage = $"Minimum invoice amount is {coupon.MinInvoiceAmount.Value:F2}" };

        decimal discount;
        if (coupon.IsPercentage)
        {
            discount = invoiceAmount * coupon.DiscountValue / 100m;
            if (coupon.MaxDiscountAmount.HasValue && discount > coupon.MaxDiscountAmount.Value)
                discount = coupon.MaxDiscountAmount.Value;
        }
        else
        {
            discount = Math.Min(coupon.DiscountValue, invoiceAmount);
        }

        return new CouponValidationResult
        {
            IsValid = true,
            DiscountAmount = discount,
            Coupon = MapToDto(coupon)
        };
    }

    private static CouponDto MapToDto(Coupon c) => new()
    {
        Id = c.Id,
        Code = c.Code,
        Description = c.Description,
        IsPercentage = c.IsPercentage,
        DiscountValue = c.DiscountValue,
        MaxDiscountAmount = c.MaxDiscountAmount,
        MinInvoiceAmount = c.MinInvoiceAmount,
        MaxUsageCount = c.MaxUsageCount,
        CurrentUsageCount = c.CurrentUsageCount,
        IsActive = c.IsActive,
        ExpiresAt = c.ExpiresAt,
        CreatedAt = c.CreatedAt
    };
}
