using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly DentalClinicDbContext _context;

    public AppointmentRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Appointment>> GetAllAsync()
    {
        return await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.Treatment)
            .OrderByDescending(a => a.AppointmentDate)
            .ThenByDescending(a => a.StartTime)
            .ToListAsync();
    }

    public async Task<Appointment?> GetByIdAsync(int id)
    {
        return await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.Treatment)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<Appointment>> GetByDateAsync(DateTime date)
    {
        return await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.Treatment)
            .Where(a => a.AppointmentDate == date)
            .OrderBy(a => a.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetByDoctorAndDateAsync(int doctorId, DateTime date)
    {
        return await _context.Appointments
            .Where(a => a.DoctorId == doctorId && a.AppointmentDate == date)
            .OrderBy(a => a.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Appointment>> GetByPatientAsync(int patientId)
    {
        return await _context.Appointments
            .Include(a => a.Doctor)
            .Include(a => a.Treatment)
            .Where(a => a.PatientId == patientId)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();
    }

    public async Task<Appointment> AddAsync(Appointment appointment)
    {
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task<Appointment> UpdateAsync(Appointment appointment)
    {
        _context.Appointments.Update(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task DeleteAsync(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment != null)
        {
            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Appointment>> GetFilteredAsync(int? doctorId, int? patientId, DateTime? date, AppointmentStatus? status)
    {
        var query = _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Include(a => a.Treatment)
            .AsQueryable();

        if (doctorId.HasValue)
            query = query.Where(a => a.DoctorId == doctorId.Value);

        if (patientId.HasValue)
            query = query.Where(a => a.PatientId == patientId.Value);

        if (date.HasValue)
            query = query.Where(a => a.AppointmentDate == date.Value);

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        return await query.OrderByDescending(a => a.AppointmentDate).ThenByDescending(a => a.StartTime).ToListAsync();
    }

    public async Task<int> GetTodayCountAsync()
    {
        var today = DateTime.Today;
        return await _context.Appointments
            .Where(a => a.AppointmentDate == today)
            .CountAsync();
    }

    public async Task<int> GetCancelledTodayCountAsync()
    {
        var today = DateTime.Today;
        return await _context.Appointments
            .Where(a => a.AppointmentDate == today && a.Status == AppointmentStatus.Cancelled)
            .CountAsync();
    }
}
