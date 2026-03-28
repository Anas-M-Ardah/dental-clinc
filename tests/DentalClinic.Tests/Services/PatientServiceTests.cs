using Moq;
using FluentAssertions;
using DentalClinic.Application.Services;
using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Services;

public class PatientServiceTests
{
    private readonly Mock<IPatientRepository> _mockRepo;
    private readonly PatientService _service;

    public PatientServiceTests()
    {
        _mockRepo = new Mock<IPatientRepository>();
        _service = new PatientService(_mockRepo.Object);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsPagedResult()
    {
        // Arrange
        var patients = new List<Patient>
        {
            TestDataFactory.CreatePatient(1, "John", "Doe"),
            TestDataFactory.CreatePatient(2, "Jane", "Smith"),
            TestDataFactory.CreatePatient(3, "Bob", "Jones")
        };
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetAllAsync(null, 1, 10);

        // Assert
        result.Data.Should().HaveCount(3);
        result.TotalCount.Should().Be(3);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task GetAllAsync_WithSearch_FiltersPatients()
    {
        // Arrange
        var patients = new List<Patient>
        {
            TestDataFactory.CreatePatient(1, "John", "Doe"),
            TestDataFactory.CreatePatient(2, "Jane", "Smith")
        };
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetAllAsync("john", 1, 10);

        // Assert
        result.Data.Should().HaveCount(1);
        result.Data[0].FirstName.Should().Be("John");
    }

    [Fact]
    public async Task GetAllAsync_WithSearch_FiltersByLastName()
    {
        // Arrange
        var patients = new List<Patient>
        {
            TestDataFactory.CreatePatient(1, "John", "Doe"),
            TestDataFactory.CreatePatient(2, "Jane", "Smith")
        };
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetAllAsync("smith", 1, 10);

        // Assert
        result.Data.Should().HaveCount(1);
        result.Data[0].LastName.Should().Be("Smith");
    }

    [Fact]
    public async Task GetAllAsync_WithSearch_FiltersByPhone()
    {
        // Arrange
        var patients = new List<Patient>
        {
            TestDataFactory.CreatePatient(1, "John", "Doe"),
            TestDataFactory.CreatePatient(2, "Jane", "Smith")
        };
        patients[0].Phone = "5551111111";
        patients[1].Phone = "5552222222";
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetAllAsync("5551111111", 1, 10);

        // Assert
        result.Data.Should().HaveCount(1);
        result.Data[0].FirstName.Should().Be("John");
    }

    [Fact]
    public async Task GetAllAsync_Pagination_ReturnsCorrectPage()
    {
        // Arrange
        var patients = Enumerable.Range(1, 15)
            .Select(i => TestDataFactory.CreatePatient(i, $"Patient{i}", "Test"))
            .ToList();
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetAllAsync(null, 2, 5);

        // Assert
        result.Data.Should().HaveCount(5);
        result.TotalCount.Should().Be(15);
        result.PageNumber.Should().Be(2);
        result.Data[0].FirstName.Should().Be("Patient6");
    }

    [Fact]
    public async Task GetAllAsync_EmptySearch_ReturnsAll()
    {
        // Arrange
        var patients = new List<Patient> { TestDataFactory.CreatePatient() };
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetAllAsync("", 1, 10);

        // Assert
        result.Data.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAllAsync_WhitespaceSearch_ReturnsAll()
    {
        // Arrange
        var patients = new List<Patient> { TestDataFactory.CreatePatient() };
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(patients);

        // Act
        var result = await _service.GetAllAsync("   ", 1, 10);

        // Assert
        result.Data.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAllAsync_NoPatients_ReturnsEmptyResult()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Patient>());

        // Act
        var result = await _service.GetAllAsync(null, 1, 10);

        // Assert
        result.Data.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsPatient()
    {
        // Arrange
        var patient = TestDataFactory.CreatePatient();
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(patient);

        // Act
        var result = await _service.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.FirstName.Should().Be("John");
        result.LastName.Should().Be("Doe");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Patient?)null);

        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_ValidDto_ReturnsCreatedPatient()
    {
        // Arrange
        var dto = TestDataFactory.CreatePatientDto();
        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Patient>()))
            .ReturnsAsync((Patient p) =>
            {
                p.Id = 1;
                return p;
            });

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.FirstName.Should().Be(dto.FirstName);
        result.LastName.Should().Be(dto.LastName);
        result.Phone.Should().Be(dto.Phone);
        result.Email.Should().Be(dto.Email);
        result.Gender.Should().Be(dto.Gender);
    }

    [Fact]
    public async Task CreateAsync_SetsCreatedAtToUtcNow()
    {
        // Arrange
        var dto = TestDataFactory.CreatePatientDto();
        Patient? capturedPatient = null;
        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Patient>()))
            .Callback<Patient>(p => capturedPatient = p)
            .ReturnsAsync((Patient p) => p);

        // Act
        var before = DateTime.UtcNow;
        await _service.CreateAsync(dto);
        var after = DateTime.UtcNow;

        // Assert
        capturedPatient.Should().NotBeNull();
        capturedPatient!.CreatedAt.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_ExistingPatient_ReturnsUpdatedPatient()
    {
        // Arrange
        var patient = TestDataFactory.CreatePatient();
        var dto = TestDataFactory.UpdatePatientDto();
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(patient);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Patient>())).ReturnsAsync((Patient p) => p);

        // Act
        var result = await _service.UpdateAsync(1, dto);

        // Assert
        result.FirstName.Should().Be(dto.FirstName);
        result.LastName.Should().Be(dto.LastName);
        result.Phone.Should().Be(dto.Phone);
    }

    [Fact]
    public async Task UpdateAsync_NonExistingPatient_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Patient?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.UpdateAsync(999, TestDataFactory.UpdatePatientDto()));
    }

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAtToUtcNow()
    {
        // Arrange
        var patient = TestDataFactory.CreatePatient();
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(patient);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Patient>())).ReturnsAsync((Patient p) => p);

        // Act
        var before = DateTime.UtcNow;
        await _service.UpdateAsync(1, TestDataFactory.UpdatePatientDto());
        var after = DateTime.UtcNow;

        // Assert
        patient.UpdatedAt.Should().NotBeNull();
        patient.UpdatedAt!.Value.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_CallsRepositoryDelete()
    {
        // Arrange & Act
        await _service.DeleteAsync(1);

        // Assert
        _mockRepo.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    #endregion
}
