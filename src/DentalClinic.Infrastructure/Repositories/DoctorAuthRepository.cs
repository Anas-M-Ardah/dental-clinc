using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class DoctorAuthRepository : IDoctorAuthRepository
{
    private readonly DentalClinicDbContext _context;

    public DoctorAuthRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<Doctor?> GetByEmailAsync(string email)
    {
        return await _context.Doctors.FirstOrDefaultAsync(d => d.Email == email);
    }

    public async Task<Doctor?> GetByRefreshTokenAsync(string refreshToken)
    {
        return await _context.Doctors.FirstOrDefaultAsync(d => d.RefreshToken == refreshToken);
    }

    public async Task<Doctor?> GetByIdAsync(int id)
    {
        return await _context.Doctors.FindAsync(id);
    }

    public async Task<Doctor> UpdateAsync(Doctor doctor)
    {
        _context.Doctors.Update(doctor);
        await _context.SaveChangesAsync();
        return doctor;
    }
}
