using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Application.Services;

public class PatientService : IPatientService
{
    private readonly IPatientRepository _patientRepository;

    public PatientService(IPatientRepository patientRepository)
    {
        _patientRepository = patientRepository;
    }

    public async Task<PagedResultDto<PatientDto>> GetAllAsync(string? search, int pageNumber, int pageSize)
    {
        var patients = await _patientRepository.GetAllAsync();
        
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            patients = patients.Where(p => 
                p.FirstName.ToLower().Contains(search) || 
                p.LastName.ToLower().Contains(search) ||
                p.Phone.Contains(search));
        }

        var totalCount = patients.Count();
        var pagedPatients = patients
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedResultDto<PatientDto>
        {
            Data = pagedPatients.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<PatientDto?> GetByIdAsync(int id)
    {
        var patient = await _patientRepository.GetByIdAsync(id);
        return patient == null ? null : MapToDto(patient);
    }

    public async Task<PatientDto> CreateAsync(CreatePatientDto dto)
    {
        var patient = new Patient
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Phone = dto.Phone,
            Email = dto.Email,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Address = dto.Address,
            MedicalHistory = dto.MedicalHistory,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _patientRepository.AddAsync(patient);
        return MapToDto(created);
    }

    public async Task<PatientDto> UpdateAsync(int id, UpdatePatientDto dto)
    {
        var patient = await _patientRepository.GetByIdAsync(id);
        if (patient == null)
            throw new KeyNotFoundException("Patient not found");

        patient.FirstName = dto.FirstName;
        patient.LastName = dto.LastName;
        patient.Phone = dto.Phone;
        patient.Email = dto.Email;
        patient.DateOfBirth = dto.DateOfBirth;
        patient.Gender = dto.Gender;
        patient.Address = dto.Address;
        patient.MedicalHistory = dto.MedicalHistory;
        patient.UpdatedAt = DateTime.UtcNow;

        var updated = await _patientRepository.UpdateAsync(patient);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        await _patientRepository.DeleteAsync(id);
    }

    private static PatientDto MapToDto(Patient patient)
    {
        return new PatientDto
        {
            Id = patient.Id,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            Phone = patient.Phone,
            Email = patient.Email,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            Address = patient.Address,
            MedicalHistory = patient.MedicalHistory,
            CreatedAt = patient.CreatedAt
        };
    }
}
