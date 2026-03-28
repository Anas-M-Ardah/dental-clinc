using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using DentalClinic.Api.Controllers;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;

namespace DentalClinic.Tests.Controllers;

public class DashboardControllerTests
{
    private readonly Mock<IDashboardService> _mockService;
    private readonly DashboardController _controller;

    public DashboardControllerTests()
    {
        _mockService = new Mock<IDashboardService>();
        _controller = new DashboardController(_mockService.Object);
    }

    #region GetStats

    [Fact]
    public async Task GetStats_ReturnsOkWithStats()
    {
        // Arrange
        var stats = new DashboardStatsDto
        {
            TodayAppointments = 5,
            TotalPatients = 100,
            MonthlyRevenue = 15000m,
            PendingInvoices = 3,
            CancelledToday = 1
        };
        _mockService.Setup(s => s.GetStatsAsync()).ReturnsAsync(stats);

        // Act
        var result = await _controller.GetStats();

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<DashboardStatsDto>().Subject;
        value.TodayAppointments.Should().Be(5);
        value.TotalPatients.Should().Be(100);
        value.MonthlyRevenue.Should().Be(15000m);
    }

    #endregion

    #region GetTodaySchedule

    [Fact]
    public async Task GetTodaySchedule_ReturnsOkWithSchedule()
    {
        // Arrange
        var schedule = new TodayScheduleDto
        {
            Date = DateTime.Today,
            Appointments = new List<AppointmentDto>
            {
                new AppointmentDto { Id = 1, StartTime = new TimeSpan(9, 0, 0) }
            }
        };
        _mockService.Setup(s => s.GetTodayScheduleAsync()).ReturnsAsync(schedule);

        // Act
        var result = await _controller.GetTodaySchedule();

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<TodayScheduleDto>().Subject;
        value.Appointments.Should().HaveCount(1);
    }

    #endregion

    #region GetRecentPatients

    [Fact]
    public async Task GetRecentPatients_ReturnsOkWithPatients()
    {
        // Arrange
        var patients = new List<PatientDto>
        {
            new PatientDto { Id = 1, FirstName = "John" }
        };
        _mockService.Setup(s => s.GetRecentPatientsAsync(5)).ReturnsAsync(patients);

        // Act
        var result = await _controller.GetRecentPatients(5);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeAssignableTo<IEnumerable<PatientDto>>().Subject;
        value.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetRecentPatients_CustomCount_PassesCountToService()
    {
        // Arrange
        _mockService.Setup(s => s.GetRecentPatientsAsync(10)).ReturnsAsync(new List<PatientDto>());

        // Act
        await _controller.GetRecentPatients(10);

        // Assert
        _mockService.Verify(s => s.GetRecentPatientsAsync(10), Times.Once);
    }

    #endregion
}
