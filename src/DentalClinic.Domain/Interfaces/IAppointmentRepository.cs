using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Domain.Interfaces;

public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetAllAsync();
    Task<Appointment?> GetByIdAsync(int id);
    Task<IEnumerable<Appointment>> GetByDateAsync(DateTime date);
    Task<IEnumerable<Appointment>> GetByDoctorAndDateAsync(int doctorId, DateTime date);
    Task<IEnumerable<Appointment>> GetByPatientAsync(int patientId);
    Task<Appointment> AddAsync(Appointment appointment);
    Task<Appointment> UpdateAsync(Appointment appointment);
    Task DeleteAsync(int id);
    Task<IEnumerable<Appointment>> GetFilteredAsync(int? doctorId, int? patientId, DateTime? date, AppointmentStatus? status);
    Task<int> GetTodayCountAsync();
    Task<int> GetCancelledTodayCountAsync();
}
