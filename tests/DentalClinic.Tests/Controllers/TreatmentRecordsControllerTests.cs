using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using DentalClinic.Api.Controllers;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Controllers;

public class TreatmentRecordsControllerTests
{
    private readonly Mock<ITreatmentRecordService> _mockService;
    private readonly TreatmentRecordsController _controller;

    public TreatmentRecordsControllerTests()
    {
        _mockService = new Mock<ITreatmentRecordService>();
        _controller = new TreatmentRecordsController(_mockService.Object);
    }

    #region GetByPatient

    [Fact]
    public async Task GetByPatient_ReturnsOkWithRecords()
    {
        // Arrange
        var records = new List<TreatmentRecordDto>
        {
            new TreatmentRecordDto { Id = 1, PatientId = 1 },
            new TreatmentRecordDto { Id = 2, PatientId = 1 }
        };
        _mockService.Setup(s => s.GetByPatientAsync(1)).ReturnsAsync(records);

        // Act
        var result = await _controller.GetByPatient(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeAssignableTo<IEnumerable<TreatmentRecordDto>>().Subject;
        value.Should().HaveCount(2);
    }

    #endregion

    #region GetById

    [Fact]
    public async Task GetById_ExistingId_ReturnsOk()
    {
        // Arrange
        var record = new TreatmentRecordDto { Id = 1, ChiefComplaint = "Pain" };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(record);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<TreatmentRecordDto>().Subject;
        value.ChiefComplaint.Should().Be("Pain");
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((TreatmentRecordDto?)null);

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
        var dto = TestDataFactory.CreateTreatmentRecordDto();
        var created = new TreatmentRecordDto { Id = 1, PatientId = dto.PatientId };
        _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        // Act
        var result = await _controller.Create(dto);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(TreatmentRecordsController.GetById));
        createdResult.RouteValues!["id"].Should().Be(1);
    }

    #endregion

    #region Update

    [Fact]
    public async Task Update_ReturnsOkWithUpdated()
    {
        // Arrange
        var dto = TestDataFactory.UpdateTreatmentRecordDto();
        var updated = new TreatmentRecordDto { Id = 1, ChiefComplaint = dto.ChiefComplaint };
        _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(updated);

        // Act
        var result = await _controller.Update(1, dto);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeOfType<TreatmentRecordDto>();
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
