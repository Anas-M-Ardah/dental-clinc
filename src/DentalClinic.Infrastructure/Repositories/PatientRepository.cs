using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class PatientRepository : IPatientRepository
{
    private readonly DentalClinicDbContext _context;

    public PatientRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Patient>> GetAllAsync()
    {
        return await _context.Patients
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Patient?> GetByIdAsync(int id)
    {
        return await _context.Patients.FindAsync(id);
    }

    public async Task<Patient?> GetByEmailAsync(string email)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.Email == email);
    }

    public async Task<Patient?> GetByRefreshTokenAsync(string refreshToken)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.RefreshToken == refreshToken);
    }

    public async Task<Patient?> GetByPasswordResetTokenAsync(string token)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.PasswordResetToken == token);
    }

    public async Task<Patient?> GetByEmailVerificationTokenAsync(string token)
    {
        return await _context.Patients.FirstOrDefaultAsync(p => p.EmailVerificationToken == token);
    }

    public async Task<Patient?> GetByIdWithAppointmentsAsync(int id)
    {
        return await _context.Patients
            .Include(p => p.Appointments)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Patient> AddAsync(Patient patient)
    {
        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();
        return patient;
    }

    public async Task<Patient> UpdateAsync(Patient patient)
    {
        _context.Patients.Update(patient);
        await _context.SaveChangesAsync();
        return patient;
    }

    public async Task DeleteAsync(int id)
    {
        var patient = await _context.Patients.FindAsync(id);
        if (patient != null)
        {
            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetCountAsync()
    {
        return await _context.Patients.CountAsync();
    }
}
