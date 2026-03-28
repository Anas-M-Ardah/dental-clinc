using Moq;
using FluentAssertions;
using DentalClinic.Application.Services;
using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Services;

public class DashboardServiceTests
{
    private readonly Mock<IPatientRepository> _mockPatientRepo;
    private readonly Mock<IAppointmentRepository> _mockAppointmentRepo;
    private readonly Mock<IInvoiceRepository> _mockInvoiceRepo;
    private readonly DashboardService _service;

    public DashboardServiceTests()
    {
        _mockPatientRepo = new Mock<IPatientRepository>();
        _mockAppointmentRepo = new Mock<IAppointmentRepository>();
        _mockInvoiceRepo = new Mock<IInvoiceRepository>();
        _service = new DashboardService(
            _mockPatientRepo.Object,
            _mockAppointmentRepo.Object,
            _mockInvoiceRepo.Object);
    }

    #region GetStatsAsync

    [Fact]
    public async Task GetStatsAsync_ReturnsCorrectStats()
    {
        // Arrange
        _mockAppointmentRepo.Setup(r => r.GetTodayCountAsync()).ReturnsAsync(5);
        _mockPatientRepo.Setup(r => r.GetCountAsync()).ReturnsAsync(100);
        _mockInvoiceRepo.Setup(r => r.GetMonthlyRevenueAsync()).ReturnsAsync(15000m);
        _mockInvoiceRepo.Setup(r => r.GetPendingCountAsync()).ReturnsAsync(3);
        _mockAppointmentRepo.Setup(r => r.GetCancelledTodayCountAsync()).ReturnsAsync(1);

        // Act
        var result = await _service.GetStatsAsync();

        // Assert
        result.TodayAppointments.Should().Be(5);
        result.TotalPatients.Should().Be(100);
        result.MonthlyRevenue.Should().Be(15000m);
        result.PendingInvoices.Should().Be(3);
        result.CancelledToday.Should().Be(1);
    }

    [Fact]
    public async Task GetStatsAsync_ZeroValues_ReturnsZeros()
    {
        // Arrange
        _mockAppointmentRepo.Setup(r => r.GetTodayCountAsync()).ReturnsAsync(0);
        _mockPatientRepo.Setup(r => r.GetCountAsync()).ReturnsAsync(0);
        _mockInvoiceRepo.Setup(r => r.GetMonthlyRevenueAsync()).ReturnsAsync(0m);
        _mockInvoiceRepo.Setup(r => r.GetPendingCountAsync()).ReturnsAsync(0);
        _mockAppointmentRepo.Setup(r => r.GetCancelledTodayCountAsync()).ReturnsAsync(0);

        // Act
        var result = await _service.GetStatsAsync();

        // Assert
        result.TodayAppointments.Should().Be(0);
        result.TotalPatients.Should().Be(0);
        result.MonthlyRevenue.Should().Be(0m);
    }

    #endregion

    #region GetTodayScheduleAsync

    [Fact]
    public async Task GetTodayScheduleAsync_ReturnsAppointmentsOrderedByTime()
    {
        // Arrange
        var appointment1 = TestDataFactory.CreateAppointment(1);
        appointment1.StartTime = new TimeSpan(14, 0, 0);
        var appointment2 = TestDataFactory.CreateAppointment(2);
        appointment2.StartTime = new TimeSpan(9, 0, 0);

        _mockAppointmentRepo.Setup(r => r.GetByDateAsync(It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Appointment> { appointment1, appointment2 });

        // Act
        var result = await _service.GetTodayScheduleAsync();

        // Assert
        result.Appointments.Should().HaveCount(2);
        result.Appointments[0].StartTime.Should().Be(new TimeSpan(9, 0, 0));
        result.Appointments[1].StartTime.Should().Be(new TimeSpan(14, 0, 0));
    }

    [Fact]
    public async Task GetTodayScheduleAsync_NoAppointments_ReturnsEmptyList()
    {
        // Arrange
        _mockAppointmentRepo.Setup(r => r.GetByDateAsync(It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Appointment>());

        // Act
        var result = await _service.GetTodayScheduleAsync();

        // Assert
        result.Appointments.Should().BeEmpty();
        result.Date.Should().Be(DateTime.Today);
    }

    [Fact]
    public async Task GetTodayScheduleAsync_MapsAppointmentFieldsCorrectly()
    {
        // Arrange
        var appointment = TestDataFactory.CreateAppointment();
        _mockAppointmentRepo.Setup(r => r.GetByDateAsync(It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Appointment> { appointment });

        // Act
        var result = await _service.GetTodayScheduleAsync();

        // Assert
        var dto = result.Appointments.First();
        dto.PatientName.Should().Be("John Doe");
        dto.DoctorName.Should().Be("Dr. Sarah Wilson");
        dto.TreatmentName.Should().Be("Teeth Cleaning");
    }

    #endregion

    #region GetRecentPatientsAsync

    [Fact]
    public async Task GetRecentPatientsAsync_ReturnsLatestPatients()
    {
        // Arrange
        var patients = new List<Patient>
        {
            TestDataFactory.CreatePatient(1, "Old", "Patient"),
            TestDataFactory.CreatePatient(2, "New", "Patient")
        };
        patients[0].CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        patients[1].CreatedAt = new DateTime(2024, 6, 1, 0, 0, 0, DateTimeKind.Utc);

        _mockPatientRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetRecentPatientsAsync(5);

        // Assert
        result.Should().HaveCount(2);
        result.First().FirstName.Should().Be("New");
    }

    [Fact]
    public async Task GetRecentPatientsAsync_LimitsToRequestedCount()
    {
        // Arrange
        var patients = Enumerable.Range(1, 10)
            .Select(i =>
            {
                var p = TestDataFactory.CreatePatient(i, $"Patient{i}", "Test");
                p.CreatedAt = new DateTime(2024, 1, i, 0, 0, 0, DateTimeKind.Utc);
                return p;
            }).ToList();

        _mockPatientRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetRecentPatientsAsync(3);

        // Assert
        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetRecentPatientsAsync_DefaultCount_Is5()
    {
        // Arrange
        var patients = Enumerable.Range(1, 10)
            .Select(i =>
            {
                var p = TestDataFactory.CreatePatient(i, $"P{i}", "T");
                p.CreatedAt = new DateTime(2024, 1, i, 0, 0, 0, DateTimeKind.Utc);
                return p;
            }).ToList();

        _mockPatientRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetRecentPatientsAsync();

        // Assert
        result.Should().HaveCount(5);
    }

    #endregion
}
