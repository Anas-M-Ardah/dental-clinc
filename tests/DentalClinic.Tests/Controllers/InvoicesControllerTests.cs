using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using DentalClinic.Api.Controllers;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Enums;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Controllers;

public class InvoicesControllerTests
{
    private readonly Mock<IInvoiceService> _mockService;
    private readonly InvoicesController _controller;

    public InvoicesControllerTests()
    {
        _mockService = new Mock<IInvoiceService>();
        _controller = new InvoicesController(_mockService.Object);
    }

    #region GetAll

    [Fact]
    public async Task GetAll_ReturnsOkWithPagedResult()
    {
        // Arrange
        var pagedResult = new PagedResultDto<InvoiceDto>
        {
            Data = new List<InvoiceDto> { new InvoiceDto { Id = 1 } },
            TotalCount = 1
        };
        _mockService.Setup(s => s.GetAllAsync(null, null, null, null, 1, 10))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetAll(null, null, null, null, 1, 10);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeOfType<PagedResultDto<InvoiceDto>>();
    }

    [Fact]
    public async Task GetAll_WithFilters_PassesAllParameters()
    {
        // Arrange
        var startDate = new DateTime(2024, 1, 1);
        var endDate = new DateTime(2024, 12, 31);
        _mockService.Setup(s => s.GetAllAsync(1, InvoiceStatus.Paid, startDate, endDate, 2, 5))
            .ReturnsAsync(new PagedResultDto<InvoiceDto>());

        // Act
        await _controller.GetAll(1, InvoiceStatus.Paid, startDate, endDate, 2, 5);

        // Assert
        _mockService.Verify(s => s.GetAllAsync(1, InvoiceStatus.Paid, startDate, endDate, 2, 5), Times.Once);
    }

    #endregion

    #region GetById

    [Fact]
    public async Task GetById_ExistingId_ReturnsOk()
    {
        // Arrange
        var invoice = new InvoiceDto { Id = 1, InvoiceNumber = "INV-001" };
        _mockService.Setup(s => s.GetByIdAsync(1)).ReturnsAsync(invoice);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<InvoiceDto>().Subject;
        value.InvoiceNumber.Should().Be("INV-001");
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _mockService.Setup(s => s.GetByIdAsync(999)).ReturnsAsync((InvoiceDto?)null);

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
        var dto = TestDataFactory.CreateInvoiceDto();
        var created = new InvoiceDto { Id = 1, PatientId = dto.PatientId };
        _mockService.Setup(s => s.CreateAsync(dto)).ReturnsAsync(created);

        // Act
        var result = await _controller.Create(dto);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(InvoicesController.GetById));
        createdResult.RouteValues!["id"].Should().Be(1);
    }

    #endregion

    #region Pay

    [Fact]
    public async Task Pay_ExistingInvoice_ReturnsOk()
    {
        // Arrange
        var dto = new PayInvoiceDto { PaymentMethod = "Cash" };
        var paid = new InvoiceDto { Id = 1, Status = InvoiceStatus.Paid, PaymentMethod = "Cash" };
        _mockService.Setup(s => s.PayAsync(1, dto)).ReturnsAsync(paid);

        // Act
        var result = await _controller.Pay(1, dto);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<InvoiceDto>().Subject;
        value.Status.Should().Be(InvoiceStatus.Paid);
    }

    #endregion

    #region Cancel

    [Fact]
    public async Task Cancel_ExistingInvoice_ReturnsOk()
    {
        // Arrange
        var cancelled = new InvoiceDto { Id = 1, Status = InvoiceStatus.Cancelled };
        _mockService.Setup(s => s.CancelAsync(1)).ReturnsAsync(cancelled);

        // Act
        var result = await _controller.Cancel(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var value = okResult.Value.Should().BeOfType<InvoiceDto>().Subject;
        value.Status.Should().Be(InvoiceStatus.Cancelled);
    }

    #endregion
}
