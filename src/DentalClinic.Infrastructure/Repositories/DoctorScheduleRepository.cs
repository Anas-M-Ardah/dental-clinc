using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class DoctorScheduleRepository : IDoctorScheduleRepository
{
    private readonly DentalClinicDbContext _context;

    public DoctorScheduleRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DoctorWorkingHours>> GetWorkingHoursAsync(int doctorId)
    {
        return await _context.DoctorWorkingHours
            .Where(wh => wh.DoctorId == doctorId)
            .OrderBy(wh => wh.DayOfWeek)
            .ToListAsync();
    }

    public async Task<DoctorWorkingHours?> GetWorkingHoursForDayAsync(int doctorId, DayOfWeek dayOfWeek)
    {
        return await _context.DoctorWorkingHours
            .FirstOrDefaultAsync(wh => wh.DoctorId == doctorId && wh.DayOfWeek == dayOfWeek);
    }

    public async Task<DoctorWorkingHours> UpsertWorkingHoursAsync(DoctorWorkingHours workingHours)
    {
        var existing = await _context.DoctorWorkingHours
            .FirstOrDefaultAsync(wh => wh.DoctorId == workingHours.DoctorId && wh.DayOfWeek == workingHours.DayOfWeek);

        if (existing != null)
        {
            existing.StartTime = workingHours.StartTime;
            existing.EndTime = workingHours.EndTime;
            existing.SlotDurationMinutes = workingHours.SlotDurationMinutes;
            existing.BufferMinutes = workingHours.BufferMinutes;
            existing.IsWorkingDay = workingHours.IsWorkingDay;
        }
        else
        {
            _context.DoctorWorkingHours.Add(workingHours);
        }

        await _context.SaveChangesAsync();
        return existing ?? workingHours;
    }

    public async Task DeleteWorkingHoursAsync(int id)
    {
        var entry = await _context.DoctorWorkingHours.FindAsync(id);
        if (entry != null)
        {
            _context.DoctorWorkingHours.Remove(entry);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<DoctorLeave>> GetLeavesAsync(int doctorId)
    {
        return await _context.DoctorLeaves
            .Where(l => l.DoctorId == doctorId)
            .OrderByDescending(l => l.StartDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<DoctorLeave>> GetUpcomingLeavesAsync(int doctorId)
    {
        var today = DateTime.Today;
        return await _context.DoctorLeaves
            .Where(l => l.DoctorId == doctorId && l.EndDate >= today)
            .OrderBy(l => l.StartDate)
            .ToListAsync();
    }

    public async Task<bool> IsOnLeaveAsync(int doctorId, DateTime date)
    {
        return await _context.DoctorLeaves
            .AnyAsync(l => l.DoctorId == doctorId && l.StartDate <= date && l.EndDate >= date);
    }

    public async Task<DoctorLeave> AddLeaveAsync(DoctorLeave leave)
    {
        _context.DoctorLeaves.Add(leave);
        await _context.SaveChangesAsync();
        return leave;
    }

    public async Task DeleteLeaveAsync(int id)
    {
        var leave = await _context.DoctorLeaves.FindAsync(id);
        if (leave != null)
        {
            _context.DoctorLeaves.Remove(leave);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<WaitingListEntry>> GetWaitingListAsync(int doctorId, DateTime date)
    {
        return await _context.WaitingListEntries
            .Include(w => w.Patient)
            .Include(w => w.Treatment)
            .Where(w => w.DoctorId == doctorId && w.PreferredDate == date && !w.IsNotified)
            .OrderBy(w => w.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<WaitingListEntry>> GetPatientWaitingListAsync(int patientId)
    {
        return await _context.WaitingListEntries
            .Include(w => w.Doctor)
            .Include(w => w.Treatment)
            .Where(w => w.PatientId == patientId && !w.IsNotified && w.PreferredDate >= DateTime.Today)
            .OrderBy(w => w.PreferredDate)
            .ToListAsync();
    }

    public async Task<WaitingListEntry> AddWaitingListEntryAsync(WaitingListEntry entry)
    {
        _context.WaitingListEntries.Add(entry);
        await _context.SaveChangesAsync();
        return entry;
    }

    public async Task DeleteWaitingListEntryAsync(int id)
    {
        var entry = await _context.WaitingListEntries.FindAsync(id);
        if (entry != null)
        {
            _context.WaitingListEntries.Remove(entry);
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkWaitingListNotifiedAsync(int id)
    {
        var entry = await _context.WaitingListEntries.FindAsync(id);
        if (entry != null)
        {
            entry.IsNotified = true;
            await _context.SaveChangesAsync();
        }
    }
}
