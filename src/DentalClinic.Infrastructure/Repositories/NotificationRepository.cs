using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly DentalClinicDbContext _context;

    public NotificationRepository(DentalClinicDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Notification>> GetByPatientIdAsync(int patientId, int limit = 20)
    {
        return await _context.Notifications
            .Where(n => n.PatientId == patientId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int patientId)
    {
        return await _context.Notifications
            .CountAsync(n => n.PatientId == patientId && !n.IsRead);
    }

    public async Task<Notification?> GetByIdAsync(int id)
    {
        return await _context.Notifications.FindAsync(id);
    }

    public async Task<Notification> AddAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task MarkAsReadAsync(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification != null)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync(int patientId)
    {
        await _context.Notifications
            .Where(n => n.PatientId == patientId && !n.IsRead)
            .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.IsRead, true)
                .SetProperty(n => n.ReadAt, DateTime.UtcNow));
    }
}
