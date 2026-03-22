using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface IDoctorRepository
{
    Task<IEnumerable<Doctor>> GetAllAsync();
    Task<Doctor?> GetByIdAsync(int id);
    Task<Doctor?> GetByIdWithAppointmentsAsync(int id, DateTime date);
}
