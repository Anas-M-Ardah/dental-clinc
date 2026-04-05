using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Infrastructure.Services;

public class DoctorScheduleService : IDoctorScheduleService
{
    private readonly IDoctorScheduleRepository _scheduleRepo;
    private readonly IDoctorRepository _doctorRepo;

    public DoctorScheduleService(
        IDoctorScheduleRepository scheduleRepo,
        IDoctorRepository doctorRepo)
    {
        _scheduleRepo = scheduleRepo;
        _doctorRepo = doctorRepo;
    }

    public async Task<IEnumerable<DoctorWorkingHoursDto>> GetWorkingHoursAsync(int doctorId)
    {
        var hours = await _scheduleRepo.GetWorkingHoursAsync(doctorId);
        return hours.Select(MapWorkingHoursToDto);
    }

    public async Task<DoctorWorkingHoursDto> UpsertWorkingHoursAsync(int doctorId, UpsertWorkingHoursDto dto)
    {
        var doctor = await _doctorRepo.GetByIdAsync(doctorId);
        if (doctor == null)
            throw new KeyNotFoundException("Doctor not found.");

        if (dto.StartTime >= dto.EndTime)
            throw new InvalidOperationException("Start time must be before end time.");

        var entity = new DoctorWorkingHours
        {
            DoctorId = doctorId,
            DayOfWeek = dto.DayOfWeek,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            SlotDurationMinutes = dto.SlotDurationMinutes,
            BufferMinutes = dto.BufferMinutes,
            IsWorkingDay = dto.IsWorkingDay
        };

        var result = await _scheduleRepo.UpsertWorkingHoursAsync(entity);
        return MapWorkingHoursToDto(result);
    }

    public async Task<IEnumerable<DoctorLeaveDto>> GetLeavesAsync(int doctorId)
    {
        var leaves = await _scheduleRepo.GetUpcomingLeavesAsync(doctorId);
        return leaves.Select(MapLeaveToDto);
    }

    public async Task<DoctorLeaveDto> AddLeaveAsync(int doctorId, CreateDoctorLeaveDto dto)
    {
        var doctor = await _doctorRepo.GetByIdAsync(doctorId);
        if (doctor == null)
            throw new KeyNotFoundException("Doctor not found.");

        if (dto.StartDate > dto.EndDate)
            throw new InvalidOperationException("Start date must be before or equal to end date.");

        if (dto.StartDate.Date < DateTime.Today)
            throw new InvalidOperationException("Cannot create leave in the past.");

        var leave = new DoctorLeave
        {
            DoctorId = doctorId,
            StartDate = dto.StartDate.Date,
            EndDate = dto.EndDate.Date,
            Reason = dto.Reason,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _scheduleRepo.AddLeaveAsync(leave);
        return MapLeaveToDto(result);
    }

    public async Task DeleteLeaveAsync(int doctorId, int leaveId)
    {
        await _scheduleRepo.DeleteLeaveAsync(leaveId);
    }

    public async Task<IEnumerable<WaitingListEntryDto>> GetPatientWaitingListAsync(int patientId)
    {
        var entries = await _scheduleRepo.GetPatientWaitingListAsync(patientId);
        return entries.Select(MapWaitingListToDto);
    }

    public async Task<WaitingListEntryDto> JoinWaitingListAsync(int patientId, CreateWaitingListEntryDto dto)
    {
        var entry = new WaitingListEntry
        {
            PatientId = patientId,
            DoctorId = dto.DoctorId,
            TreatmentId = dto.TreatmentId,
            PreferredDate = dto.PreferredDate.Date,
            PreferredTime = dto.PreferredTime,
            IsNotified = false,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _scheduleRepo.AddWaitingListEntryAsync(entry);
        return MapWaitingListToDto(result);
    }

    public async Task LeaveWaitingListAsync(int patientId, int entryId)
    {
        await _scheduleRepo.DeleteWaitingListEntryAsync(entryId);
    }

    private static DoctorWorkingHoursDto MapWorkingHoursToDto(DoctorWorkingHours wh) => new()
    {
        Id = wh.Id,
        DoctorId = wh.DoctorId,
        DayOfWeek = wh.DayOfWeek,
        StartTime = wh.StartTime,
        EndTime = wh.EndTime,
        SlotDurationMinutes = wh.SlotDurationMinutes,
        BufferMinutes = wh.BufferMinutes,
        IsWorkingDay = wh.IsWorkingDay
    };

    private static DoctorLeaveDto MapLeaveToDto(DoctorLeave l) => new()
    {
        Id = l.Id,
        DoctorId = l.DoctorId,
        StartDate = l.StartDate,
        EndDate = l.EndDate,
        Reason = l.Reason,
        CreatedAt = l.CreatedAt
    };

    private static WaitingListEntryDto MapWaitingListToDto(WaitingListEntry w) => new()
    {
        Id = w.Id,
        PatientId = w.PatientId,
        PatientName = w.Patient != null ? $"{w.Patient.FirstName} {w.Patient.LastName}" : string.Empty,
        DoctorId = w.DoctorId,
        DoctorName = w.Doctor != null ? $"Dr. {w.Doctor.FirstName} {w.Doctor.LastName}" : string.Empty,
        TreatmentId = w.TreatmentId,
        TreatmentName = w.Treatment?.Name ?? string.Empty,
        PreferredDate = w.PreferredDate,
        PreferredTime = w.PreferredTime,
        CreatedAt = w.CreatedAt
    };
}
