using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using DentalClinic.Api.Controllers;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Enums;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Controllers;

public class AppointmentsControllerTests
{
    private readonly Mock<IAppointmentService> _mockService;
    private readonly AppointmentsController _controller;

    public AppointmentsControllerTests()
    {
        _mockService = new Mock<IAppointmentService>();
        _controller = new AppointmentsController(_mockService.Object);
    }

    #region GetAll

    [Fact]
    public async Task GetAll_ReturnsOkWithPagedResult()
    {
        // Arrange
        var pagedResult = new PagedResultDto<AppointmentDto>
        {
            Data = new List<AppointmentDto> { new AppointmentDto { Id = 1 } },
            TotalCount = 1
        };
        _mockService.Setup(s => s.GetAllAsync(null, null, null, null, 1, 10))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetAll(null, null, null, null, 1, 10);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<PagedResultDto<AppointmentDto>>().Subject;
        value.Data.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAll_WithFilters_PassesAllFilters()
    {
        // Arrange
        var date = new DateTime(2024, 6, 15);
        _mockService.Setup(s => s.GetAllAsync(1, 2, date, AppointmentStatus.Confirmed, 1, 10))
            .ReturnsAsync(new PagedResultDto<AppointmentDto>());

        // Act
        await _controller.GetAll(1, 2, date, AppointmentStatus.Confirmed, 1, 10);

        // Assert
        _mockService.Verify(s => s.GetAllAsync(1, 2, date, AppointmentStatus.Confirmed, 1, 10), Times.Once);
    }

    #endregion

    #region GetById

    [Fact]
    public async Task GetById_ExistingId_ReturnsOk()
    {
        // Arrange
        var appointment = new AppointmentDto { Id = 1 };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(appointment);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        result.Result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((AppointmentDto?)null);

        // Act
        var result = await _controller.GetById(999);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region GetAvailableSlots

    [Fact]
    public async Task GetAvailableSlots_ReturnsOkWithSlots()
    {
        // Arrange
        var date = new DateTime(2024, 6, 15);
        var response = new AvailableSlotsResponseDto
        {
            Date = date,
            DoctorId = 1,
            AvailableSlots = new List<AvailableSlotDto>
            {
                new AvailableSlotDto { StartTime = new TimeSpan(9, 0, 0), EndTime = new TimeSpan(9, 30, 0) }
            }
        };
        _mockService.Setup(s => s.GetAvailableSlotsAsync(1, date)).ReturnsAsync(response);

        // Act
        var result = await _controller.GetAvailableSlots(1, date);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<AvailableSlotsResponseDto>().Subject;
        value.AvailableSlots.Should().HaveCount(1);
    }

    #endregion

    #region Create

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedAtAction()
    {
        // Arrange
        var dto = TestDataFactory.CreateAppointmentDto();
        var created = new AppointmentDto { Id = 1, PatientId = dto.PatientId };
        _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        // Act
        var result = await _controller.Create(dto);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(AppointmentsController.GetById));
        createdResult.RouteValues!["id"].Should().Be(1);
    }

    #endregion

    #region Update

    [Fact]
    public async Task Update_ReturnsOkWithUpdatedAppointment()
    {
        // Arrange
        var dto = TestDataFactory.UpdateAppointmentDto();
        var updated = new AppointmentDto { Id = 1, Status = AppointmentStatus.Confirmed };
        _mockService.Setup(s => s.UpdateAsync(1, dto)).ReturnsAsync(updated);

        // Act
        var result = await _controller.Update(1, dto);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<AppointmentDto>().Subject;
        value.Status.Should().Be(AppointmentStatus.Confirmed);
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
