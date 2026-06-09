using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface IDoctorAuthRepository
{
    Task<Doctor?> GetByEmailAsync(string email);
    Task<Doctor?> GetByRefreshTokenAsync(string refreshToken);
    Task<Doctor?> GetByIdAsync(int id);
    Task<Doctor> UpdateAsync(Doctor doctor);
}
