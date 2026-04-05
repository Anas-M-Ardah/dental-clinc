using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface ICouponRepository
{
    Task<IEnumerable<Coupon>> GetAllAsync();
    Task<Coupon?> GetByIdAsync(int id);
    Task<Coupon?> GetByCodeAsync(string code);
    Task<Coupon> AddAsync(Coupon coupon);
    Task<Coupon> UpdateAsync(Coupon coupon);
    Task DeleteAsync(int id);
}
