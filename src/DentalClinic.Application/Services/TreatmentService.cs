using System.Linq;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Application.Services;

public class TreatmentService : ITreatmentService
{
    private readonly ITreatmentRepository _treatmentRepository;

    public TreatmentService(ITreatmentRepository treatmentRepository)
    {
        _treatmentRepository = treatmentRepository;
    }

    public async Task<IEnumerable<TreatmentDto>> GetAllAsync()
    {
        var treatments = await _treatmentRepository.GetAllAsync();
        return treatments.Where(t => t.IsActive).Select(MapToDto);
    }

    public async Task<TreatmentDto?> GetByIdAsync(int id)
    {
        var treatment = await _treatmentRepository.GetByIdAsync(id);
        return treatment == null ? null : MapToDto(treatment);
    }

    public async Task<TreatmentDto> CreateAsync(CreateTreatmentDto dto)
    {
        var treatment = new Treatment
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            DurationMinutes = dto.DurationMinutes,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _treatmentRepository.AddAsync(treatment);
        return MapToDto(created);
    }

    public async Task<TreatmentDto> UpdateAsync(int id, CreateTreatmentDto dto)
    {
        var treatment = await _treatmentRepository.GetByIdAsync(id);
        if (treatment == null)
            throw new Exception("Treatment not found");

        treatment.Name = dto.Name;
        treatment.Description = dto.Description;
        treatment.Price = dto.Price;
        treatment.DurationMinutes = dto.DurationMinutes;

        var updated = await _treatmentRepository.UpdateAsync(treatment);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        var treatment = await _treatmentRepository.GetByIdAsync(id);
        if (treatment == null)
            throw new Exception("Treatment not found");

        treatment.IsActive = false;
        await _treatmentRepository.UpdateAsync(treatment);
    }

    private static TreatmentDto MapToDto(Treatment treatment)
    {
        return new TreatmentDto
        {
            Id = treatment.Id,
            Name = treatment.Name,
            Description = treatment.Description,
            Price = treatment.Price,
            DurationMinutes = treatment.DurationMinutes,
            IsActive = treatment.IsActive
        };
    }
}
