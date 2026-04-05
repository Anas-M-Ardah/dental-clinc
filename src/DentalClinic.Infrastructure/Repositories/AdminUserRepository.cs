using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class AdminUserRepository : IAdminUserRepository
{
    private readonly DentalClinicDbContext _context;

    public AdminUserRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<AdminUser?> GetByEmailAsync(string email)
    {
        return await _context.AdminUsers.FirstOrDefaultAsync(a => a.Email == email);
    }

    public async Task<AdminUser?> GetByRefreshTokenAsync(string refreshToken)
    {
        return await _context.AdminUsers.FirstOrDefaultAsync(a => a.RefreshToken == refreshToken);
    }

    public async Task<AdminUser?> GetByIdAsync(int id)
    {
        return await _context.AdminUsers.FindAsync(id);
    }

    public async Task<AdminUser> AddAsync(AdminUser adminUser)
    {
        _context.AdminUsers.Add(adminUser);
        await _context.SaveChangesAsync();
        return adminUser;
    }

    public async Task<AdminUser> UpdateAsync(AdminUser adminUser)
    {
        _context.AdminUsers.Update(adminUser);
        await _context.SaveChangesAsync();
        return adminUser;
    }
}
