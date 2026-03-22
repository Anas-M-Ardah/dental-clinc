using System.Linq;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IPatientRepository _patientRepository;
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IInvoiceRepository _invoiceRepository;

    public DashboardService(
        IPatientRepository patientRepository,
        IAppointmentRepository appointmentRepository,
        IInvoiceRepository invoiceRepository)
    {
        _patientRepository = patientRepository;
        _appointmentRepository = appointmentRepository;
        _invoiceRepository = invoiceRepository;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var todayAppointments = await _appointmentRepository.GetTodayCountAsync();
        var totalPatients = await _patientRepository.GetCountAsync();
        var monthlyRevenue = await _invoiceRepository.GetMonthlyRevenueAsync();
        var pendingInvoices = await _invoiceRepository.GetPendingCountAsync();
        var cancelledToday = await _appointmentRepository.GetCancelledTodayCountAsync();

        return new DashboardStatsDto
        {
            TodayAppointments = todayAppointments,
            TotalPatients = totalPatients,
            MonthlyRevenue = monthlyRevenue,
            PendingInvoices = pendingInvoices,
            CancelledToday = cancelledToday
        };
    }

    public async Task<TodayScheduleDto> GetTodayScheduleAsync()
    {
        var today = DateTime.Today;
        var appointments = await _appointmentRepository.GetByDateAsync(today);

        return new TodayScheduleDto
        {
            Date = today,
            Appointments = appointments.Select(a => new AppointmentDto
            {
                Id = a.Id,
                PatientId = a.PatientId,
                PatientName = $"{a.Patient.FirstName} {a.Patient.LastName}",
                DoctorId = a.DoctorId,
                DoctorName = $"Dr. {a.Doctor.FirstName} {a.Doctor.LastName}",
                AppointmentDate = a.AppointmentDate,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                TreatmentId = a.TreatmentId,
                TreatmentName = a.Treatment.Name,
                Notes = a.Notes,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            }).OrderBy(a => a.StartTime).ToList()
        };
    }

    public async Task<IEnumerable<PatientDto>> GetRecentPatientsAsync(int count = 5)
    {
        var patients = await _patientRepository.GetAllAsync();
        return patients.OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .Select(p => new PatientDto
            {
                Id = p.Id,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Phone = p.Phone,
                Email = p.Email,
                DateOfBirth = p.DateOfBirth,
                Gender = p.Gender,
                Address = p.Address,
                MedicalHistory = p.MedicalHistory,
                CreatedAt = p.CreatedAt
            });
    }
}
