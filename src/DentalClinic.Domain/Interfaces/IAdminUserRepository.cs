using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface IAdminUserRepository
{
    Task<AdminUser?> GetByEmailAsync(string email);
    Task<AdminUser?> GetByRefreshTokenAsync(string refreshToken);
    Task<AdminUser?> GetByIdAsync(int id);
    Task<AdminUser> AddAsync(AdminUser adminUser);
    Task<AdminUser> UpdateAsync(AdminUser adminUser);
}
