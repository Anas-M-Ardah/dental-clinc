using Moq;
using FluentAssertions;
using DentalClinic.Application.Services;
using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Services;

public class TreatmentServiceTests
{
    private readonly Mock<ITreatmentRepository> _mockRepo;
    private readonly TreatmentService _service;

    public TreatmentServiceTests()
    {
        _mockRepo = new Mock<ITreatmentRepository>();
        _service = new TreatmentService(_mockRepo.Object);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsOnlyActiveTreatments()
    {
        // Arrange
        var treatments = new List<Treatment>
        {
            TestDataFactory.CreateTreatment(1, "Cleaning"),
            TestDataFactory.CreateTreatment(2, "Filling"),
        };
        var inactive = TestDataFactory.CreateTreatment(3, "Removed");
        inactive.IsActive = false;
        treatments.Add(inactive);

        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(treatments);

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().NotContain(t => t.Name == "Removed");
    }

    [Fact]
    public async Task GetAllAsync_NoTreatments_ReturnsEmpty()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Treatment>());

        // Act
        var result = await _service.GetAllAsync();

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsTreatmentDto()
    {
        // Arrange
        var treatment = TestDataFactory.CreateTreatment();
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(treatment);

        // Act
        var result = await _service.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.Name.Should().Be("Teeth Cleaning");
        result.Price.Should().Be(100m);
        result.DurationMinutes.Should().Be(30);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Treatment?)null);

        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_ValidDto_ReturnsCreatedTreatment()
    {
        // Arrange
        var dto = TestDataFactory.CreateTreatmentDto();
        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Treatment>()))
            .ReturnsAsync((Treatment t) =>
            {
                t.Id = 1;
                return t;
            });

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        result.Name.Should().Be(dto.Name);
        result.Price.Should().Be(dto.Price);
        result.DurationMinutes.Should().Be(dto.DurationMinutes);
        result.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task CreateAsync_SetsIsActiveTrue()
    {
        // Arrange
        var dto = TestDataFactory.CreateTreatmentDto();
        Treatment? capturedTreatment = null;
        _mockRepo.Setup(r => r.AddAsync(It.IsAny<Treatment>()))
            .Callback<Treatment>(t => capturedTreatment = t)
            .ReturnsAsync((Treatment t) => t);

        // Act
        await _service.CreateAsync(dto);

        // Assert
        capturedTreatment!.IsActive.Should().BeTrue();
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_ExistingTreatment_ReturnsUpdated()
    {
        // Arrange
        var treatment = TestDataFactory.CreateTreatment();
        var dto = new CreateTreatmentDto
        {
            Name = "Updated Treatment",
            Description = "Updated desc",
            Price = 250m,
            DurationMinutes = 45
        };
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(treatment);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Treatment>())).ReturnsAsync((Treatment t) => t);

        // Act
        var result = await _service.UpdateAsync(1, dto);

        // Assert
        result.Name.Should().Be("Updated Treatment");
        result.Price.Should().Be(250m);
        result.DurationMinutes.Should().Be(45);
    }

    [Fact]
    public async Task UpdateAsync_NonExistingTreatment_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Treatment?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.UpdateAsync(999, TestDataFactory.CreateTreatmentDto()));
    }

    #endregion

    #region DeleteAsync (Soft Delete)

    [Fact]
    public async Task DeleteAsync_ExistingTreatment_SetsIsActiveFalse()
    {
        // Arrange
        var treatment = TestDataFactory.CreateTreatment();
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(treatment);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Treatment>())).ReturnsAsync((Treatment t) => t);

        // Act
        await _service.DeleteAsync(1);

        // Assert
        treatment.IsActive.Should().BeFalse();
        _mockRepo.Verify(r => r.UpdateAsync(treatment), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_NonExistingTreatment_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Treatment?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.DeleteAsync(999));
    }

    [Fact]
    public async Task DeleteAsync_DoesNotCallDeleteOnRepository()
    {
        // Arrange
        var treatment = TestDataFactory.CreateTreatment();
        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(treatment);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Treatment>())).ReturnsAsync((Treatment t) => t);

        // Act
        await _service.DeleteAsync(1);

        // Assert - soft delete uses UpdateAsync, not DeleteAsync
        _mockRepo.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
    }

    #endregion
}
