using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly DentalClinicDbContext _context;

    public DocumentRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Document>> GetByPatientIdAsync(int patientId)
    {
        return await _context.Documents
            .Include(d => d.Patient)
            .Where(d => d.PatientId == patientId && !d.IsArchived)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Document>> GetByTreatmentRecordIdAsync(int treatmentRecordId)
    {
        return await _context.Documents
            .Include(d => d.Patient)
            .Where(d => d.TreatmentRecordId == treatmentRecordId && !d.IsArchived)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();
    }

    public async Task<Document?> GetByIdAsync(int id)
    {
        return await _context.Documents
            .Include(d => d.Patient)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Document> AddAsync(Document document)
    {
        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        return document;
    }

    public async Task<Document> UpdateAsync(Document document)
    {
        _context.Documents.Update(document);
        await _context.SaveChangesAsync();
        return document;
    }

    public async Task DeleteAsync(int id)
    {
        var doc = await _context.Documents.FindAsync(id);
        if (doc != null)
        {
            _context.Documents.Remove(doc);
            await _context.SaveChangesAsync();
        }
    }
}
