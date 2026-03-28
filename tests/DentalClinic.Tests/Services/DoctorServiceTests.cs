using Moq;
using FluentAssertions;
using DentalClinic.Application.Services;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Services;

public class DoctorServiceTests
{
    private readonly Mock<IDoctorRepository> _mockRepo;
    private readonly DoctorService _service;

    public DoctorServiceTests()
    {
        _mockRepo = new Mock<IDoctorRepository>();
        _service = new DoctorService(_mockRepo.Object);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsDoctorDtos()
    {
        // Arrange
        var doctors = new List<Doctor>
        {
            TestDataFactory.CreateDoctor(1, "Sarah", "Wilson"),
            TestDataFactory.CreateDoctor(2, "James", "Brown")
        };
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(doctors);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
        result.First().FirstName.Should().Be("Sarah");
    }

    [Fact]
    public async Task GetAllAsync_EmptyList_ReturnsEmpty()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Doctor>());

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsDoctorDto()
    {
        // Arrange
        var doctor = TestDataFactory.CreateDoctor();
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(doctor);

        // Act
        var result = await _service.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.FirstName.Should().Be("Sarah");
        result.Specialization.Should().Be("Orthodontics");
        result.IsAvailable.Should().BeTrue();
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Doctor?)null);

        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetScheduleAsync

    [Fact]
    public async Task GetScheduleAsync_ExistingDoctor_ReturnsSchedule()
    {
        // Arrange
        var doctor = TestDataFactory.CreateDoctor();
        var date = new DateTime(2024, 6, 15);
        var appointment = TestDataFactory.CreateAppointment();

        var doctorWithAppointments = TestDataFactory.CreateDoctor();
        doctorWithAppointments.Appointments = new List<Appointment> { appointment };

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(doctor);
        _mockRepo.Setup(r => r.GetByIdWithAppointmentsAsync(1, date)).ReturnsAsync(doctorWithAppointments);

        // Act
        var result = await _service.GetScheduleAsync(1, date);

        // Assert
        result.DoctorId.Should().Be(1);
        result.DoctorName.Should().Be("Dr. Sarah Wilson");
        result.Date.Should().Be(date);
        result.Appointments.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetScheduleAsync_NonExistingDoctor_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Doctor?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.GetScheduleAsync(999, DateTime.Today));
    }

    [Fact]
    public async Task GetScheduleAsync_NoAppointments_ReturnsEmptySchedule()
    {
        // Arrange
        var doctor = TestDataFactory.CreateDoctor();
        var date = new DateTime(2024, 6, 15);

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(doctor);
        _mockRepo.Setup(r => r.GetByIdWithAppointmentsAsync(1, date)).ReturnsAsync((Doctor?)null);

        // Act
        var result = await _service.GetScheduleAsync(1, date);

        // Assert
        result.Appointments.Should().BeEmpty();
    }

    #endregion

    #region Mapping

    [Fact]
    public async Task GetByIdAsync_MapsAllFieldsCorrectly()
    {
        // Arrange
        var doctor = TestDataFactory.CreateDoctor();
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(doctor);

        // Act
        var result = await _service.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(doctor.Id);
        result.FirstName.Should().Be(doctor.FirstName);
        result.LastName.Should().Be(doctor.LastName);
        result.Specialization.Should().Be(doctor.Specialization);
        result.Phone.Should().Be(doctor.Phone);
        result.Email.Should().Be(doctor.Email);
        result.Bio.Should().Be(doctor.Bio);
        result.IsAvailable.Should().Be(doctor.IsAvailable);
    }

    #endregion
}
