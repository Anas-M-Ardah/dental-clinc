using DentalClinic.Domain.Entities;

namespace DentalClinic.Domain.Interfaces;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByPatientIdAsync(int patientId, int limit = 20);
    Task<int> GetUnreadCountAsync(int patientId);
    Task<Notification?> GetByIdAsync(int id);
    Task<Notification> AddAsync(Notification notification);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync(int patientId);
}
