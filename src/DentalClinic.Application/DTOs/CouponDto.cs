using System.ComponentModel.DataAnnotations;

namespace DentalClinic.Application.DTOs;

public class CouponDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPercentage { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal? MinInvoiceAmount { get; set; }
    public int? MaxUsageCount { get; set; }
    public int CurrentUsageCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCouponDto
{
    [Required, StringLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string Description { get; set; } = string.Empty;

    public bool IsPercentage { get; set; }

    [Required, Range(0.01, double.MaxValue)]
    public decimal DiscountValue { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal? MaxDiscountAmount { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal? MinInvoiceAmount { get; set; }

    [Range(1, int.MaxValue)]
    public int? MaxUsageCount { get; set; }

    public DateTime? ExpiresAt { get; set; }
}

public class ApplyCouponDto
{
    [Required, StringLength(50)]
    public string CouponCode { get; set; } = string.Empty;
}

public class CouponValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public decimal DiscountAmount { get; set; }
    public CouponDto? Coupon { get; set; }
}
