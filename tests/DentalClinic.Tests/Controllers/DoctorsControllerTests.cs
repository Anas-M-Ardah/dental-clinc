using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using DentalClinic.Api.Controllers;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;

namespace DentalClinic.Tests.Controllers;

public class DoctorsControllerTests
{
    private readonly Mock<IDoctorService> _mockService;
    private readonly DoctorsController _controller;

    public DoctorsControllerTests()
    {
        _mockService = new Mock<IDoctorService>();
        _controller = new DoctorsController(_mockService.Object);
    }

    #region GetAll

    [Fact]
    public async Task GetAll_ReturnsOkWithDoctors()
    {
        // Arrange
        var doctors = new List<DoctorDto>
        {
            new DoctorDto { Id = 1, FirstName = "Sarah", LastName = "Wilson" }
        };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(doctors);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeAssignableTo<IEnumerable<DoctorDto>>().Subject;
        value.Should().HaveCount(1);
    }

    #endregion

    #region GetById

    [Fact]
    public async Task GetById_ExistingId_ReturnsOkWithDoctor()
    {
        // Arrange
        var doctor = new DoctorDto { Id = 1, FirstName = "Sarah" };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(doctor);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeOfType<DoctorDto>();
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((DoctorDto?)null);

        // Act
        var result = await _controller.GetById(999);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region GetSchedule

    [Fact]
    public async Task GetSchedule_WithDate_ReturnsOkWithSchedule()
    {
        // Arrange
        var date = new DateTime(2024, 6, 15);
        var schedule = new DoctorScheduleDto
        {
            DoctorId = 1,
            DoctorName = "Dr. Sarah Wilson",
            Date = date,
            Appointments = new List<AppointmentDto>()
        };
        _mockService.Setup(s => s.GetScheduleAsync(1, date)).ReturnsAsync(schedule);

        // Act
        var result = await _controller.GetSchedule(1, date);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<DoctorScheduleDto>().Subject;
        value.DoctorId.Should().Be(1);
        value.Date.Should().Be(date);
    }

    [Fact]
    public async Task GetSchedule_NullDate_UsesToday()
    {
        // Arrange
        var today = DateTime.Today;
        _mockService.Setup(s => s.GetScheduleAsync(1, today))
            .ReturnsAsync(new DoctorScheduleDto { DoctorId = 1, Date = today });

        // Act
        var result = await _controller.GetSchedule(1, null);

        // Assert
        _mockService.Verify(s => s.GetScheduleAsync(1, today), Times.Once);
    }

    #endregion
}
