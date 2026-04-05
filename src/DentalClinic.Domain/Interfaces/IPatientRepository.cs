using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface IPatientRepository
{
    Task<IEnumerable<Patient>> GetAllAsync();
    Task<Patient?> GetByIdAsync(int id);
    Task<Patient?> GetByEmailAsync(string email);
    Task<Patient?> GetByRefreshTokenAsync(string refreshToken);
    Task<Patient?> GetByPasswordResetTokenAsync(string token);
    Task<Patient?> GetByEmailVerificationTokenAsync(string token);
    Task<Patient?> GetByIdWithAppointmentsAsync(int id);
    Task<Patient> AddAsync(Patient patient);
    Task<Patient> UpdateAsync(Patient patient);
    Task DeleteAsync(int id);
    Task<int> GetCountAsync();
}
