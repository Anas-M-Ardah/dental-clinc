using DentalClinic.Application.DTOs;

namespace DentalClinic.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetByPatientIdAsync(int patientId);
    Task<int> GetUnreadCountAsync(int patientId);
    Task CreateAsync(int patientId, string title, string message, string type);
    Task MarkAsReadAsync(int patientId, int notificationId);
    Task MarkAllAsReadAsync(int patientId);
}
