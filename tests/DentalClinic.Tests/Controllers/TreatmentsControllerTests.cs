using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using DentalClinic.Api.Controllers;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Controllers;

public class TreatmentsControllerTests
{
    private readonly Mock<ITreatmentService> _mockService;
    private readonly TreatmentsController _controller;

    public TreatmentsControllerTests()
    {
        _mockService = new Mock<ITreatmentService>();
        _controller = new TreatmentsController(_mockService.Object);
    }

    #region GetAll

    [Fact]
    public async Task GetAll_ReturnsOkWithTreatments()
    {
        // Arrange
        var treatments = new List<TreatmentDto>
        {
            new TreatmentDto { Id = 1, Name = "Cleaning", Price = 100m }
        };
        _mockService.Setup(s => s.GetAllAsync()).ReturnsAsync(treatments);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeAssignableTo<IEnumerable<TreatmentDto>>().Subject;
        value.Should().HaveCount(1);
    }

    #endregion

    #region GetById

    [Fact]
    public async Task GetById_ExistingId_ReturnsOk()
    {
        // Arrange
        var treatment = new TreatmentDto { Id = 1, Name = "Cleaning" };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(treatment);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<TreatmentDto>().Subject;
        value.Name.Should().Be("Cleaning");
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((TreatmentDto?)null);

        // Act
        var result = await _controller.GetById(999);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region Create

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedAtAction()
    {
        // Arrange
        var dto = TestDataFactory.CreateTreatmentDto();
        var created = new TreatmentDto { Id = 1, Name = dto.Name };
        _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        // Act
        var result = await _controller.Create(dto);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(TreatmentsController.GetById));
        createdResult.RouteValues!["id"].Should().Be(1);
    }

    #endregion

    #region Update

    [Fact]
    public async Task Update_ReturnsOkWithUpdated()
    {
        // Arrange
        var dto = TestDataFactory.CreateTreatmentDto();
        var updated = new TreatmentDto { Id = 1, Name = dto.Name, Price = dto.Price };
        _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(updated);

        // Act
        var result = await _controller.Update(1, dto);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeOfType<TreatmentDto>();
    }

    #endregion

    #region Delete

    [Fact]
    public async Task Delete_ReturnsNoContent()
    {
        // Arrange
        _mockService.Setup(s => s.DeleteAsync(1)).Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Delete(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    #endregion
}
