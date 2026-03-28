using Moq;
using FluentAssertions;
using DentalClinic.Application.Services;
using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Services;

public class AppointmentServiceTests
{
    private readonly Mock<IAppointmentRepository> _mockAppointmentRepo;
    private readonly Mock<IPatientRepository> _mockPatientRepo;
    private readonly Mock<IDoctorRepository> _mockDoctorRepo;
    private readonly Mock<ITreatmentRepository> _mockTreatmentRepo;
    private readonly AppointmentService _service;

    public AppointmentServiceTests()
    {
        _mockAppointmentRepo = new Mock<IAppointmentRepository>();
        _mockPatientRepo = new Mock<IPatientRepository>();
        _mockDoctorRepo = new Mock<IDoctorRepository>();
        _mockTreatmentRepo = new Mock<ITreatmentRepository>();
        _service = new AppointmentService(
            _mockAppointmentRepo.Object,
            _mockPatientRepo.Object,
            _mockDoctorRepo.Object,
            _mockTreatmentRepo.Object);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsPagedResult()
    {
        // Arrange
        var appointments = new List<Appointment>
        {
            TestDataFactory.CreateAppointment(1),
            TestDataFactory.CreateAppointment(2)
        };
        _mockAppointmentRepo.Setup(r => r.GetFilteredAsync(null, null, null, null))
            .ReturnsAsync(appointments);

        // Act
        var result = await _service.GetAllAsync(null, null, null, null, 1, 10);

        // Assert
        result.Data.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetAllAsync_WithFilters_PassesFiltersToRepository()
    {
        // Arrange
        var date = new DateTime(2024, 6, 15);
        _mockAppointmentRepo.Setup(r => r.GetFilteredAsync(1, 2, date, AppointmentStatus.Pending))
            .ReturnsAsync(new List<Appointment>());

        // Act
        await _service.GetAllAsync(1, 2, date, AppointmentStatus.Pending, 1, 10);

        // Assert
        _mockAppointmentRepo.Verify(r => r.GetFilteredAsync(1, 2, date, AppointmentStatus.Pending), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_Pagination_WorksCorrectly()
    {
        // Arrange
        var appointments = Enumerable.Range(1, 10)
            .Select(i => TestDataFactory.CreateAppointment(i))
            .ToList();
        _mockAppointmentRepo.Setup(r => r.GetFilteredAsync(null, null, null, null))
            .ReturnsAsync(appointments);

        // Act
        var result = await _service.GetAllAsync(null, null, null, null, 2, 3);

        // Assert
        result.Data.Should().HaveCount(3);
        result.TotalCount.Should().Be(10);
        result.PageNumber.Should().Be(2);
        result.PageSize.Should().Be(3);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsAppointmentDto()
    {
        // Arrange
        var appointment = TestDataFactory.CreateAppointment();
        _mockAppointmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(appointment);

        // Act
        var result = await _service.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.PatientName.Should().Be("John Doe");
        result.DoctorName.Should().Be("Dr. Sarah Wilson");
        result.TreatmentName.Should().Be("Teeth Cleaning");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        _mockAppointmentRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Appointment?)null);

        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetAvailableSlotsAsync

    [Fact]
    public async Task GetAvailableSlotsAsync_NoBookings_ReturnsAllSlots()
    {
        // Arrange
        var doctor = TestDataFactory.CreateDoctor();
        var date = new DateTime(2024, 6, 15);
        _mockDoctorRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(doctor);
        _mockAppointmentRepo.Setup(r => r.GetByDoctorAndDateAsync(1, date))
            .ReturnsAsync(new List<Appointment>());

        // Act
        var result = await _service.GetAvailableSlotsAsync(1, date);

        // Assert
        result.AvailableSlots.Should().HaveCount(18); // 8:00-17:00 in 30-min slots
        result.DoctorId.Should().Be(1);
        result.Date.Should().Be(date);
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_SomeBooked_ExcludesBookedSlots()
    {
        // Arrange
        var doctor = TestDataFactory.CreateDoctor();
        var date = new DateTime(2024, 6, 15);
        var bookedAppointment = TestDataFactory.CreateAppointment();
        bookedAppointment.StartTime = new TimeSpan(9, 0, 0);

        _mockDoctorRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(doctor);
        _mockAppointmentRepo.Setup(r => r.GetByDoctorAndDateAsync(1, date))
            .ReturnsAsync(new List<Appointment> { bookedAppointment });

        // Act
        var result = await _service.GetAvailableSlotsAsync(1, date);

        // Assert
        result.AvailableSlots.Should().HaveCount(17);
        result.AvailableSlots.Should().NotContain(s => s.StartTime == new TimeSpan(9, 0, 0));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_NonExistingDoctor_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockDoctorRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Doctor?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.GetAvailableSlotsAsync(999, DateTime.Today));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_SlotsStartAt8AM()
    {
        // Arrange
        var doctor = TestDataFactory.CreateDoctor();
        _mockDoctorRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(doctor);
        _mockAppointmentRepo.Setup(r => r.GetByDoctorAndDateAsync(1, It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Appointment>());

        // Act
        var result = await _service.GetAvailableSlotsAsync(1, DateTime.Today);

        // Assert
        result.AvailableSlots.First().StartTime.Should().Be(new TimeSpan(8, 0, 0));
    }

    [Fact]
    public async Task GetAvailableSlotsAsync_LastSlotEndsBefore5PM()
    {
        // Arrange
        var doctor = TestDataFactory.CreateDoctor();
        _mockDoctorRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(doctor);
        _mockAppointmentRepo.Setup(r => r.GetByDoctorAndDateAsync(1, It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Appointment>());

        // Act
        var result = await _service.GetAvailableSlotsAsync(1, DateTime.Today);

        // Assert
        result.AvailableSlots.Last().StartTime.Should().Be(new TimeSpan(16, 30, 0));
        result.AvailableSlots.Last().EndTime.Should().Be(new TimeSpan(17, 0, 0));
    }

    #endregion

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_ValidDto_ReturnsCreatedAppointment()
    {
        // Arrange
        var dto = TestDataFactory.CreateAppointmentDto();
        var patient = TestDataFactory.CreatePatient();
        var doctor = TestDataFactory.CreateDoctor();
        var treatment = TestDataFactory.CreateTreatment(durationMinutes: 30);
        var appointmentWithDetails = TestDataFactory.CreateAppointment(1);

        _mockPatientRepo.Setup(r => r.GetByIdAsync(dto.PatientId)).ReturnsAsync(patient);
        _mockDoctorRepo.Setup(r => r.GetByIdAsync(dto.DoctorId)).ReturnsAsync(doctor);
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(dto.TreatmentId)).ReturnsAsync(treatment);
        _mockAppointmentRepo.Setup(r => r.AddAsync(It.IsAny<Appointment>()))
            .ReturnsAsync((Appointment a) => { a.Id = 1; return a; });
        _mockAppointmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(appointmentWithDetails);

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.PatientId.Should().Be(appointmentWithDetails.PatientId);
        result.DoctorId.Should().Be(appointmentWithDetails.DoctorId);
        result.Status.Should().Be(AppointmentStatus.Pending);
    }

    [Fact]
    public async Task CreateAsync_CalculatesEndTime()
    {
        // Arrange
        var dto = TestDataFactory.CreateAppointmentDto();
        dto.StartTime = new TimeSpan(10, 0, 0);
        var patient = TestDataFactory.CreatePatient();
        var doctor = TestDataFactory.CreateDoctor();
        var treatment = TestDataFactory.CreateTreatment(durationMinutes: 60);
        var appointmentWithDetails = TestDataFactory.CreateAppointment();

        _mockPatientRepo.Setup(r => r.GetByIdAsync(dto.PatientId)).ReturnsAsync(patient);
        _mockDoctorRepo.Setup(r => r.GetByIdAsync(dto.DoctorId)).ReturnsAsync(doctor);
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(dto.TreatmentId)).ReturnsAsync(treatment);

        Appointment? capturedAppointment = null;
        _mockAppointmentRepo.Setup(r => r.AddAsync(It.IsAny<Appointment>()))
            .Callback<Appointment>(a => capturedAppointment = a)
            .ReturnsAsync((Appointment a) => { a.Id = 1; return a; });
        _mockAppointmentRepo.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync(appointmentWithDetails);

        // Act
        await _service.CreateAsync(dto);

        // Assert
        capturedAppointment!.EndTime.Should().Be(new TimeSpan(11, 0, 0));
    }

    [Fact]
    public async Task CreateAsync_PatientNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var dto = TestDataFactory.CreateAppointmentDto();
        _mockPatientRepo.Setup(r => r.GetByIdAsync(dto.PatientId)).ReturnsAsync((Patient?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_DoctorNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var dto = TestDataFactory.CreateAppointmentDto();
        _mockPatientRepo.Setup(r => r.GetByIdAsync(dto.PatientId)).ReturnsAsync(TestDataFactory.CreatePatient());
        _mockDoctorRepo.Setup(r => r.GetByIdAsync(dto.DoctorId)).ReturnsAsync((Doctor?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_TreatmentNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var dto = TestDataFactory.CreateAppointmentDto();
        _mockPatientRepo.Setup(r => r.GetByIdAsync(dto.PatientId)).ReturnsAsync(TestDataFactory.CreatePatient());
        _mockDoctorRepo.Setup(r => r.GetByIdAsync(dto.DoctorId)).ReturnsAsync(TestDataFactory.CreateDoctor());
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(dto.TreatmentId)).ReturnsAsync((Treatment?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(dto));
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_ExistingAppointment_ReturnsUpdated()
    {
        // Arrange
        var appointment = TestDataFactory.CreateAppointment();
        var dto = TestDataFactory.UpdateAppointmentDto();
        var treatment = TestDataFactory.CreateTreatment();

        var updatedAppointment = TestDataFactory.CreateAppointment();
        updatedAppointment.AppointmentDate = dto.AppointmentDate;
        updatedAppointment.Status = dto.Status;

        _mockAppointmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(appointment);
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(appointment.TreatmentId)).ReturnsAsync(treatment);
        _mockAppointmentRepo.Setup(r => r.UpdateAsync(It.IsAny<Appointment>()))
            .ReturnsAsync((Appointment a) => a)
            .Callback<Appointment>(_ =>
            {
                // After update, re-fetch returns the updated appointment
                _mockAppointmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(updatedAppointment);
            });

        // Act
        var result = await _service.UpdateAsync(1, dto);

        // Assert
        result.AppointmentDate.Should().Be(dto.AppointmentDate);
        result.Status.Should().Be(dto.Status);
    }

    [Fact]
    public async Task UpdateAsync_NonExistingAppointment_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockAppointmentRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Appointment?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.UpdateAsync(999, TestDataFactory.UpdateAppointmentDto()));
    }

    [Fact]
    public async Task UpdateAsync_RecalculatesEndTime()
    {
        // Arrange
        var appointment = TestDataFactory.CreateAppointment();
        var dto = TestDataFactory.UpdateAppointmentDto();
        dto.StartTime = new TimeSpan(14, 0, 0);
        var treatment = TestDataFactory.CreateTreatment(durationMinutes: 45);

        _mockAppointmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(appointment);
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(appointment.TreatmentId)).ReturnsAsync(treatment);
        _mockAppointmentRepo.Setup(r => r.UpdateAsync(It.IsAny<Appointment>()))
            .ReturnsAsync((Appointment a) => a)
            .Callback<Appointment>(_ =>
            {
                _mockAppointmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(appointment);
            });

        // Act
        await _service.UpdateAsync(1, dto);

        // Assert
        appointment.EndTime.Should().Be(new TimeSpan(14, 45, 0));
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_CallsRepositoryDelete()
    {
        // Act
        await _service.DeleteAsync(1);

        // Assert
        _mockAppointmentRepo.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    #endregion
}
