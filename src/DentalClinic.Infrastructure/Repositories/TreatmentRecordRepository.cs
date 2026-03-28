using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class TreatmentRecordRepository : ITreatmentRecordRepository
{
    private readonly DentalClinicDbContext _context;

    public TreatmentRecordRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TreatmentRecord>> GetByPatientAsync(int patientId)
    {
        return await _context.TreatmentRecords
            .Include(r => r.Patient)
            .Include(r => r.Doctor)
            .Where(r => r.PatientId == patientId)
            .OrderByDescending(r => r.VisitDate)
            .ToListAsync();
    }

    public async Task<TreatmentRecord?> GetByIdAsync(int id)
    {
        return await _context.TreatmentRecords.FindAsync(id);
    }

    public async Task<TreatmentRecord?> GetByIdWithDetailsAsync(int id)
    {
        return await _context.TreatmentRecords
            .Include(r => r.Patient)
            .Include(r => r.Doctor)
            .Include(r => r.Appointment)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<TreatmentRecord> AddAsync(TreatmentRecord record)
    {
        _context.TreatmentRecords.Add(record);
        await _context.SaveChangesAsync();
        return record;
    }

    public async Task<TreatmentRecord> UpdateAsync(TreatmentRecord record)
    {
        _context.TreatmentRecords.Update(record);
        await _context.SaveChangesAsync();
        return record;
    }

    public async Task DeleteAsync(int id)
    {
        var record = await _context.TreatmentRecords.FindAsync(id);
        if (record != null)
        {
            _context.TreatmentRecords.Remove(record);
            await _context.SaveChangesAsync();
        }
    }
}
