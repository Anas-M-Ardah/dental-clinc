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
    private readonly IDoctorScheduleRepository _scheduleRepository;

    public AppointmentService(
        IAppointmentRepository appointmentRepository,
        IPatientRepository patientRepository,
        IDoctorRepository doctorRepository,
        ITreatmentRepository treatmentRepository,
        IDoctorScheduleRepository scheduleRepository)
    {
        _appointmentRepository = appointmentRepository;
        _patientRepository = patientRepository;
        _doctorRepository = doctorRepository;
        _treatmentRepository = treatmentRepository;
        _scheduleRepository = scheduleRepository;
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

        // Check if doctor is on leave
        var isOnLeave = await _scheduleRepository.IsOnLeaveAsync(doctorId, date);
        if (isOnLeave)
        {
            return new AvailableSlotsResponseDto
            {
                Date = date,
                DoctorId = doctorId,
                AvailableSlots = new List<AvailableSlotDto>(),
                Message = "Doctor is on leave on this date."
            };
        }

        // Check if within booking window
        if (date.Date < DateTime.Today)
        {
            return new AvailableSlotsResponseDto
            {
                Date = date,
                DoctorId = doctorId,
                AvailableSlots = new List<AvailableSlotDto>(),
                Message = "Cannot book appointments in the past."
            };
        }

        if (date.Date > DateTime.Today.AddDays(doctor.MaxFutureBookingDays))
        {
            return new AvailableSlotsResponseDto
            {
                Date = date,
                DoctorId = doctorId,
                AvailableSlots = new List<AvailableSlotDto>(),
                Message = $"Cannot book more than {doctor.MaxFutureBookingDays} days in advance."
            };
        }

        // Get working hours for the day of week
        var workingHours = await _scheduleRepository.GetWorkingHoursForDayAsync(doctorId, date.DayOfWeek);
        if (workingHours == null || !workingHours.IsWorkingDay)
        {
            return new AvailableSlotsResponseDto
            {
                Date = date,
                DoctorId = doctorId,
                AvailableSlots = new List<AvailableSlotDto>(),
                Message = "Doctor does not work on this day."
            };
        }

        // Get existing appointments (non-cancelled)
        var existingAppointments = (await _appointmentRepository.GetByDoctorAndDateAsync(doctorId, date))
            .Where(a => a.Status != AppointmentStatus.Cancelled)
            .ToList();

        // Generate slots from working hours
        var allSlots = GenerateTimeSlotsFromWorkingHours(workingHours);

        // Filter out slots that conflict with existing appointments
        var minAdvanceTime = DateTime.UtcNow.AddHours(doctor.MinAdvanceBookingHours);
        var availableSlots = allSlots.Where(slot =>
        {
            // Check minimum advance booking time
            var slotDateTime = date.Date.Add(slot.StartTime);
            if (slotDateTime < minAdvanceTime)
                return false;

            // Check for conflicts with existing appointments (time range overlap)
            foreach (var existing in existingAppointments)
            {
                if (slot.StartTime < existing.EndTime && slot.EndTime > existing.StartTime)
                    return false;
            }

            return true;
        }).ToList();

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

        var appointmentDate = dto.AppointmentDate.Date;
        var endTime = dto.StartTime.Add(TimeSpan.FromMinutes(treatment.DurationMinutes));

        // Validate: not in the past
        if (appointmentDate < DateTime.Today)
            throw new InvalidOperationException("Cannot book appointments in the past.");

        // Validate: minimum advance booking
        var slotDateTime = appointmentDate.Add(dto.StartTime);
        if (slotDateTime < DateTime.UtcNow.AddHours(doctor.MinAdvanceBookingHours))
            throw new InvalidOperationException($"Appointments must be booked at least {doctor.MinAdvanceBookingHours} hours in advance.");

        // Validate: max future booking
        if (appointmentDate > DateTime.Today.AddDays(doctor.MaxFutureBookingDays))
            throw new InvalidOperationException($"Cannot book more than {doctor.MaxFutureBookingDays} days in advance.");

        // Validate: doctor is not on leave
        var isOnLeave = await _scheduleRepository.IsOnLeaveAsync(dto.DoctorId, appointmentDate);
        if (isOnLeave)
            throw new InvalidOperationException("Doctor is on leave on this date.");

        // Validate: working hours
        var workingHours = await _scheduleRepository.GetWorkingHoursForDayAsync(dto.DoctorId, appointmentDate.DayOfWeek);
        if (workingHours == null || !workingHours.IsWorkingDay)
            throw new InvalidOperationException("Doctor does not work on this day.");

        if (dto.StartTime < workingHours.StartTime || endTime > workingHours.EndTime)
            throw new InvalidOperationException("Appointment time is outside doctor's working hours.");

        // Validate: treatment duration fits within working hours
        if (endTime > workingHours.EndTime)
            throw new InvalidOperationException("Treatment duration exceeds available time in the selected slot.");

        // Validate: no conflicts with existing appointments
        var existingAppointments = (await _appointmentRepository.GetByDoctorAndDateAsync(dto.DoctorId, appointmentDate))
            .Where(a => a.Status != AppointmentStatus.Cancelled)
            .ToList();

        foreach (var existing in existingAppointments)
        {
            if (dto.StartTime < existing.EndTime && endTime > existing.StartTime)
                throw new InvalidOperationException("This time slot conflicts with an existing appointment.");
        }

        var appointment = new Appointment
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            AppointmentDate = appointmentDate,
            StartTime = dto.StartTime,
            EndTime = endTime,
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

    public async Task<AppointmentDto> RescheduleAsync(int id, RescheduleAppointmentDto dto)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null)
            throw new KeyNotFoundException("Appointment not found");

        if (appointment.Status == AppointmentStatus.Completed || appointment.Status == AppointmentStatus.Cancelled)
            throw new InvalidOperationException("Cannot reschedule a completed or cancelled appointment.");

        var treatment = await _treatmentRepository.GetByIdAsync(appointment.TreatmentId);
        var endTime = dto.NewStartTime.Add(TimeSpan.FromMinutes(treatment?.DurationMinutes ?? 30));
        var newDate = dto.NewDate.Date;

        // Validate: not in the past
        if (newDate < DateTime.Today)
            throw new InvalidOperationException("Cannot reschedule to a past date.");

        // Validate: doctor is not on leave
        var isOnLeave = await _scheduleRepository.IsOnLeaveAsync(appointment.DoctorId, newDate);
        if (isOnLeave)
            throw new InvalidOperationException("Doctor is on leave on this date.");

        // Validate: working hours
        var workingHours = await _scheduleRepository.GetWorkingHoursForDayAsync(appointment.DoctorId, newDate.DayOfWeek);
        if (workingHours == null || !workingHours.IsWorkingDay)
            throw new InvalidOperationException("Doctor does not work on this day.");

        if (dto.NewStartTime < workingHours.StartTime || endTime > workingHours.EndTime)
            throw new InvalidOperationException("Appointment time is outside doctor's working hours.");

        // Validate: no conflicts (excluding current appointment)
        var existingAppointments = (await _appointmentRepository.GetByDoctorAndDateAsync(appointment.DoctorId, newDate))
            .Where(a => a.Status != AppointmentStatus.Cancelled && a.Id != id)
            .ToList();

        foreach (var existing in existingAppointments)
        {
            if (dto.NewStartTime < existing.EndTime && endTime > existing.StartTime)
                throw new InvalidOperationException("This time slot conflicts with an existing appointment.");
        }

        appointment.AppointmentDate = newDate;
        appointment.StartTime = dto.NewStartTime;
        appointment.EndTime = endTime;
        appointment.UpdatedAt = DateTime.UtcNow;

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

    private static List<AvailableSlotDto> GenerateTimeSlotsFromWorkingHours(DoctorWorkingHours workingHours)
    {
        var slots = new List<AvailableSlotDto>();
        var slotDuration = TimeSpan.FromMinutes(workingHours.SlotDurationMinutes);
        var buffer = TimeSpan.FromMinutes(workingHours.BufferMinutes);
        var currentTime = workingHours.StartTime;

        while (currentTime.Add(slotDuration) <= workingHours.EndTime)
        {
            slots.Add(new AvailableSlotDto
            {
                StartTime = currentTime,
                EndTime = currentTime.Add(slotDuration)
            });
            currentTime = currentTime.Add(slotDuration).Add(buffer);
        }

        return slots;
    }
}
