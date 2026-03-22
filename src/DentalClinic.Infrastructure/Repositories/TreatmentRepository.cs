using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class TreatmentRepository : ITreatmentRepository
{
    private readonly DentalClinicDbContext _context;

    public TreatmentRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Treatment>> GetAllAsync()
    {
        return await _context.Treatments
            .OrderBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<Treatment?> GetByIdAsync(int id)
    {
        return await _context.Treatments.FindAsync(id);
    }

    public async Task<Treatment> AddAsync(Treatment treatment)
    {
        _context.Treatments.Add(treatment);
        await _context.SaveChangesAsync();
        return treatment;
    }

    public async Task<Treatment> UpdateAsync(Treatment treatment)
    {
        _context.Treatments.Update(treatment);
        await _context.SaveChangesAsync();
        return treatment;
    }

    public async Task DeleteAsync(int id)
    {
        var treatment = await _context.Treatments.FindAsync(id);
        if (treatment != null)
        {
            _context.Treatments.Remove(treatment);
            await _context.SaveChangesAsync();
        }
    }
}
