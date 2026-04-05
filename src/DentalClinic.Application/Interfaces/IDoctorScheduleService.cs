using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface IDoctorScheduleService
{
    // Working Hours
    Task<IEnumerable<DoctorWorkingHoursDto>> GetWorkingHoursAsync(int doctorId);
    Task<DoctorWorkingHoursDto> UpsertWorkingHoursAsync(int doctorId, UpsertWorkingHoursDto dto);

    // Leaves
    Task<IEnumerable<DoctorLeaveDto>> GetLeavesAsync(int doctorId);
    Task<DoctorLeaveDto> AddLeaveAsync(int doctorId, CreateDoctorLeaveDto dto);
    Task DeleteLeaveAsync(int doctorId, int leaveId);

    // Waiting List
    Task<IEnumerable<WaitingListEntryDto>> GetPatientWaitingListAsync(int patientId);
    Task<WaitingListEntryDto> JoinWaitingListAsync(int patientId, CreateWaitingListEntryDto dto);
    Task LeaveWaitingListAsync(int patientId, int entryId);
}
