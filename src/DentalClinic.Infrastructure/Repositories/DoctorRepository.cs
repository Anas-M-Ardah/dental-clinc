using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class DoctorRepository : IDoctorRepository
{
    private readonly DentalClinicDbContext _context;

    public DoctorRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Doctor>> GetAllAsync()
    {
        return await _context.Doctors
            .Where(d => d.IsAvailable)
            .OrderBy(d => d.FirstName)
            .ToListAsync();
    }

    public async Task<Doctor?> GetByIdAsync(int id)
    {
        return await _context.Doctors.FindAsync(id);
    }

    public async Task<Doctor?> GetByIdWithAppointmentsAsync(int id, DateTime date)
    {
        return await _context.Doctors
            .Include(d => d.Appointments
                .Where(a => a.AppointmentDate == date)
                .OrderBy(a => a.StartTime))
            .ThenInclude(a => a.Patient)
            .Include(d => d.Appointments)
            .ThenInclude(a => a.Treatment)
            .FirstOrDefaultAsync(d => d.Id == id);
    }
}
