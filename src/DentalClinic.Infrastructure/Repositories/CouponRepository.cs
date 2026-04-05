using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class CouponRepository : ICouponRepository
{
    private readonly DentalClinicDbContext _context;

    public CouponRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Coupon>> GetAllAsync()
    {
        return await _context.Coupons
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Coupon?> GetByIdAsync(int id)
    {
        return await _context.Coupons.FindAsync(id);
    }

    public async Task<Coupon?> GetByCodeAsync(string code)
    {
        return await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == code);
    }

    public async Task<Coupon> AddAsync(Coupon coupon)
    {
        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();
        return coupon;
    }

    public async Task<Coupon> UpdateAsync(Coupon coupon)
    {
        _context.Coupons.Update(coupon);
        await _context.SaveChangesAsync();
        return coupon;
    }

    public async Task DeleteAsync(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon != null)
        {
            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();
        }
    }
}
