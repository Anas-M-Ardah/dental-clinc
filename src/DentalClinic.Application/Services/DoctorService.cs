using System.Linq;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Application.Services;

public class DoctorService : IDoctorService
{
    private readonly IDoctorRepository _doctorRepository;
    private readonly IAppointmentRepository _appointmentRepository;

    public DoctorService(IDoctorRepository doctorRepository, IAppointmentRepository appointmentRepository)
    {
        _doctorRepository = doctorRepository;
        _appointmentRepository = appointmentRepository;
    }

    public async Task<IEnumerable<DoctorDto>> GetAllAsync()
    {
        var doctors = await _doctorRepository.GetAllAsync();
        return doctors.Select(MapToDto);
    }

    public async Task<DoctorDto?> GetByIdAsync(int id)
    {
        var doctor = await _doctorRepository.GetByIdAsync(id);
        return doctor == null ? null : MapToDto(doctor);
    }

    public async Task<DoctorScheduleDto> GetScheduleAsync(int id, DateTime date)
    {
        var doctor = await _doctorRepository.GetByIdAsync(id);
        if (doctor == null)
            throw new Exception("Doctor not found");

        var doctorWithAppointments = await _doctorRepository.GetByIdWithAppointmentsAsync(id, date);

        return new DoctorScheduleDto
        {
            DoctorId = doctor.Id,
            DoctorName = $"Dr. {doctor.FirstName} {doctor.LastName}",
            Date = date,
            Appointments = (doctorWithAppointments?.Appointments ?? Enumerable.Empty<Appointment>()).Select(a => new AppointmentDto
            {
                Id = a.Id,
                PatientId = a.PatientId,
                PatientName = $"{a.Patient.FirstName} {a.Patient.LastName}",
                DoctorId = a.DoctorId,
                DoctorName = $"Dr. {doctor.FirstName} {doctor.LastName}",
                AppointmentDate = a.AppointmentDate,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                TreatmentId = a.TreatmentId,
                TreatmentName = a.Treatment.Name,
                Notes = a.Notes,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            }).ToList()
        };
    }

    private static DoctorDto MapToDto(Doctor doctor)
    {
        return new DoctorDto
        {
            Id = doctor.Id,
            FirstName = doctor.FirstName,
            LastName = doctor.LastName,
            Specialization = doctor.Specialization,
            Phone = doctor.Phone,
            Email = doctor.Email,
            Bio = doctor.Bio,
            IsAvailable = doctor.IsAvailable
        };
    }
}
