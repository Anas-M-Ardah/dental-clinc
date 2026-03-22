using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface ITreatmentRepository
{
    Task<IEnumerable<Treatment>> GetAllAsync();
    Task<Treatment?> GetByIdAsync(int id);
    Task<Treatment> AddAsync(Treatment treatment);
    Task<Treatment> UpdateAsync(Treatment treatment);
    Task DeleteAsync(int id);
}
