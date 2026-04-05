using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface IDoctorScheduleRepository
{
    // Working Hours
    Task<IEnumerable<DoctorWorkingHours>> GetWorkingHoursAsync(int doctorId);
    Task<DoctorWorkingHours?> GetWorkingHoursForDayAsync(int doctorId, DayOfWeek dayOfWeek);
    Task<DoctorWorkingHours> UpsertWorkingHoursAsync(DoctorWorkingHours workingHours);
    Task DeleteWorkingHoursAsync(int id);

    // Leaves
    Task<IEnumerable<DoctorLeave>> GetLeavesAsync(int doctorId);
    Task<IEnumerable<DoctorLeave>> GetUpcomingLeavesAsync(int doctorId);
    Task<bool> IsOnLeaveAsync(int doctorId, DateTime date);
    Task<DoctorLeave> AddLeaveAsync(DoctorLeave leave);
    Task DeleteLeaveAsync(int id);

    // Waiting List
    Task<IEnumerable<WaitingListEntry>> GetWaitingListAsync(int doctorId, DateTime date);
    Task<IEnumerable<WaitingListEntry>> GetPatientWaitingListAsync(int patientId);
    Task<WaitingListEntry> AddWaitingListEntryAsync(WaitingListEntry entry);
    Task DeleteWaitingListEntryAsync(int id);
    Task MarkWaitingListNotifiedAsync(int id);
}
