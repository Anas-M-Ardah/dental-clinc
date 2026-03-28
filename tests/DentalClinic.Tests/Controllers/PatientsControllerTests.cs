using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using DentalClinic.Api.Controllers;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Enums;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Controllers;

public class PatientsControllerTests
{
    private readonly Mock<IPatientService> _mockService;
    private readonly PatientsController _controller;

    public PatientsControllerTests()
    {
        _mockService = new Mock<IPatientService>();
        _controller = new PatientsController(_mockService.Object);
    }

    #region GetAll

    [Fact]
    public async Task GetAll_ReturnsOkWithPagedResult()
    {
        // Arrange
        var pagedResult = new PagedResultDto<PatientDto>
        {
            Data = new List<PatientDto> { new PatientDto { Id = 1, FirstName = "John" } },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 10
        };
        _mockService.Setup(s => s.GetAllAsync(null, 1, 10)).ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetAll(null, 1, 10);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<PagedResultDto<PatientDto>>().Subject;
        value.Data.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAll_WithSearch_PassesSearchToService()
    {
        // Arrange
        _mockService.Setup(s => s.GetAllAsync("test", 1, 10))
            .ReturnsAsync(new PagedResultDto<PatientDto>());

        // Act
        await _controller.GetAll("test", 1, 10);

        // Assert
        _mockService.Verify(s => s.GetAllAsync("test", 1, 10), Times.Once);
    }

    #endregion

    #region GetById

    [Fact]
    public async Task GetById_ExistingId_ReturnsOkWithPatient()
    {
        // Arrange
        var patient = new PatientDto { Id = 1, FirstName = "John", LastName = "Doe" };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(patient);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<PatientDto>().Subject;
        value.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((PatientDto?)null);

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
        var dto = TestDataFactory.CreatePatientDto();
        var created = new PatientDto { Id = 1, FirstName = dto.FirstName, LastName = dto.LastName };
        _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        // Act
        var result = await _controller.Create(dto);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(PatientsController.GetById));
        createdResult.RouteValues!["id"].Should().Be(1);
        var value = createdResult.Value.Should().BeOfType<PatientDto>().Subject;
        value.Id.Should().Be(1);
    }

    #endregion

    #region Update

    [Fact]
    public async Task Update_ExistingId_ReturnsOkWithUpdatedPatient()
    {
        // Arrange
        var dto = TestDataFactory.UpdatePatientDto();
        var updated = new PatientDto { Id = 1, FirstName = dto.FirstName, LastName = dto.LastName };
        _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(updated);

        // Act
        var result = await _controller.Update(1, dto);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<PatientDto>().Subject;
        value.LastName.Should().Be("Updated");
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

    [Fact]
    public async Task Delete_CallsServiceDelete()
    {
        // Arrange
        _mockService.Setup(s => s.DeleteAsync(1)).Returns(Task.CompletedTask);

        // Act
        await _controller.Delete(1);

        // Assert
        _mockService.Verify(s => s.DeleteAsync(1), Times.Once);
    }

    #endregion
}
