using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;

    public NotificationService(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<NotificationDto>> GetByPatientIdAsync(int patientId)
    {
        var notifications = await _repository.GetByPatientIdAsync(patientId);
        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        });
    }

    public async Task<int> GetUnreadCountAsync(int patientId)
    {
        return await _repository.GetUnreadCountAsync(patientId);
    }

    public async Task CreateAsync(int patientId, string title, string message, string type)
    {
        await _repository.AddAsync(new Notification
        {
            PatientId = patientId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });
    }

    public async Task MarkAsReadAsync(int patientId, int notificationId)
    {
        var notification = await _repository.GetByIdAsync(notificationId);
        if (notification == null || notification.PatientId != patientId)
            throw new KeyNotFoundException("Notification not found.");

        await _repository.MarkAsReadAsync(notificationId);
    }

    public async Task MarkAllAsReadAsync(int patientId)
    {
        await _repository.MarkAllAsReadAsync(patientId);
    }
}
