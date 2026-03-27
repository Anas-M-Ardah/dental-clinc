using System.Linq;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Application.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IDoctorRepository _doctorRepository;
    private readonly ITreatmentRepository _treatmentRepository;

    public AppointmentService(
        IAppointmentRepository appointmentRepository,
        IPatientRepository patientRepository,
        IDoctorRepository doctorRepository,
        ITreatmentRepository treatmentRepository)
    {
        _appointmentRepository = appointmentRepository;
        _patientRepository = patientRepository;
        _doctorRepository = doctorRepository;
        _treatmentRepository = treatmentRepository;
    }

    public async Task<PagedResultDto<AppointmentDto>> GetAllAsync(int? doctorId, int? patientId, DateTime? date, AppointmentStatus? status, int pageNumber, int pageSize)
    {
        var appointments = await _appointmentRepository.GetFilteredAsync(doctorId, patientId, date, status);
        
        var totalCount = appointments.Count();
        var pagedAppointments = appointments
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedResultDto<AppointmentDto>
        {
            Data = pagedAppointments.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<AppointmentDto?> GetByIdAsync(int id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        return appointment == null ? null : MapToDto(appointment);
    }

    public async Task<AvailableSlotsResponseDto> GetAvailableSlotsAsync(int doctorId, DateTime date)
    {
        var doctor = await _doctorRepository.GetByIdAsync(doctorId);
        if (doctor == null)
            throw new KeyNotFoundException("Doctor not found");

        var existingAppointments = await _appointmentRepository.GetByDoctorAndDateAsync(doctorId, date);
        var bookedSlots = existingAppointments.Select(a => a.StartTime).ToHashSet();

        var allSlots = GenerateTimeSlots();
        var availableSlots = allSlots.Where(s => !bookedSlots.Contains(s.StartTime)).ToList();

        return new AvailableSlotsResponseDto
        {
            Date = date,
            DoctorId = doctorId,
            AvailableSlots = availableSlots
        };
    }

    public async Task<AppointmentDto> CreateAsync(CreateAppointmentDto dto)
    {
        var patient = await _patientRepository.GetByIdAsync(dto.PatientId);
        if (patient == null)
            throw new KeyNotFoundException("Patient not found");

        var doctor = await _doctorRepository.GetByIdAsync(dto.DoctorId);
        if (doctor == null)
            throw new KeyNotFoundException("Doctor not found");

        var treatment = await _treatmentRepository.GetByIdAsync(dto.TreatmentId);
        if (treatment == null)
            throw new KeyNotFoundException("Treatment not found");

        var appointment = new Appointment
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            AppointmentDate = dto.AppointmentDate,
            StartTime = dto.StartTime,
            EndTime = dto.StartTime.Add(TimeSpan.FromMinutes(treatment.DurationMinutes)),
            TreatmentId = dto.TreatmentId,
            Notes = dto.Notes,
            Status = AppointmentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _appointmentRepository.AddAsync(appointment);
        return MapToDto(created);
    }

    public async Task<AppointmentDto> UpdateAsync(int id, UpdateAppointmentDto dto)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null)
            throw new KeyNotFoundException("Appointment not found");

        appointment.AppointmentDate = dto.AppointmentDate;
        appointment.StartTime = dto.StartTime;
        appointment.DoctorId = dto.DoctorId;
        appointment.Notes = dto.Notes;
        appointment.Status = dto.Status;
        appointment.UpdatedAt = DateTime.UtcNow;

        var treatment = await _treatmentRepository.GetByIdAsync(appointment.TreatmentId);
        if (treatment != null)
        {
            appointment.EndTime = dto.StartTime.Add(TimeSpan.FromMinutes(treatment.DurationMinutes));
        }

        var updated = await _appointmentRepository.UpdateAsync(appointment);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        await _appointmentRepository.DeleteAsync(id);
    }

    private static AppointmentDto MapToDto(Appointment appointment)
    {
        return new AppointmentDto
        {
            Id = appointment.Id,
            PatientId = appointment.PatientId,
            PatientName = $"{appointment.Patient.FirstName} {appointment.Patient.LastName}",
            DoctorId = appointment.DoctorId,
            DoctorName = $"Dr. {appointment.Doctor.FirstName} {appointment.Doctor.LastName}",
            AppointmentDate = appointment.AppointmentDate,
            StartTime = appointment.StartTime,
            EndTime = appointment.EndTime,
            TreatmentId = appointment.TreatmentId,
            TreatmentName = appointment.Treatment.Name,
            Notes = appointment.Notes,
            Status = appointment.Status,
            CreatedAt = appointment.CreatedAt
        };
    }

    private static List<AvailableSlotDto> GenerateTimeSlots()
    {
        var slots = new List<AvailableSlotDto>();
        var startTime = new TimeSpan(8, 0, 0);
        var endTime = new TimeSpan(17, 0, 0);

        while (startTime < endTime)
        {
            slots.Add(new AvailableSlotDto
            {
                StartTime = startTime,
                EndTime = startTime.Add(TimeSpan.FromMinutes(30))
            });
            startTime = startTime.Add(TimeSpan.FromMinutes(30));
        }

        return slots;
    }
}
