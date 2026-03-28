using Moq;
using FluentAssertions;
using DentalClinic.Application.Services;
using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Services;

public class InvoiceServiceTests
{
    private readonly Mock<IInvoiceRepository> _mockInvoiceRepo;
    private readonly Mock<IPatientRepository> _mockPatientRepo;
    private readonly Mock<ITreatmentRepository> _mockTreatmentRepo;
    private readonly InvoiceService _service;

    public InvoiceServiceTests()
    {
        _mockInvoiceRepo = new Mock<IInvoiceRepository>();
        _mockPatientRepo = new Mock<IPatientRepository>();
        _mockTreatmentRepo = new Mock<ITreatmentRepository>();
        _service = new InvoiceService(
            _mockInvoiceRepo.Object,
            _mockPatientRepo.Object,
            _mockTreatmentRepo.Object);
    }

    #region GetAllAsync

    [Fact]
    public async Task GetAllAsync_ReturnsPagedResult()
    {
        // Arrange
        var invoices = new List<Invoice>
        {
            TestDataFactory.CreateInvoice(1),
            TestDataFactory.CreateInvoice(2)
        };
        _mockInvoiceRepo.Setup(r => r.GetFilteredAsync(null, null, null, null))
            .ReturnsAsync(invoices);

        // Act
        var result = await _service.GetAllAsync(null, null, null, null, 1, 10);

        // Assert
        result.Data.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task GetAllAsync_WithFilters_PassesThemToRepository()
    {
        // Arrange
        var startDate = new DateTime(2024, 1, 1);
        var endDate = new DateTime(2024, 12, 31);
        _mockInvoiceRepo.Setup(r => r.GetFilteredAsync(1, InvoiceStatus.Paid, startDate, endDate))
            .ReturnsAsync(new List<Invoice>());

        // Act
        await _service.GetAllAsync(1, InvoiceStatus.Paid, startDate, endDate, 1, 10);

        // Assert
        _mockInvoiceRepo.Verify(r => r.GetFilteredAsync(1, InvoiceStatus.Paid, startDate, endDate), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_Pagination_ReturnsCorrectPage()
    {
        // Arrange
        var invoices = Enumerable.Range(1, 8)
            .Select(i => TestDataFactory.CreateInvoice(i))
            .ToList();
        _mockInvoiceRepo.Setup(r => r.GetFilteredAsync(null, null, null, null))
            .ReturnsAsync(invoices);

        // Act
        var result = await _service.GetAllAsync(null, null, null, null, 2, 3);

        // Assert
        result.Data.Should().HaveCount(3);
        result.TotalCount.Should().Be(8);
        result.PageNumber.Should().Be(2);
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsInvoiceWithItems()
    {
        // Arrange
        var invoice = TestDataFactory.CreateInvoice();
        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(1)).ReturnsAsync(invoice);

        // Act
        var result = await _service.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.InvoiceNumber.Should().Be("INV-20240101-ABCD1234");
        result.PatientName.Should().Be("John Doe");
        result.Items.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(999)).ReturnsAsync((Invoice?)null);

        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_ValidDto_ReturnsCreatedInvoice()
    {
        // Arrange
        var dto = TestDataFactory.CreateInvoiceDto();
        var patient = TestDataFactory.CreatePatient();
        var treatment = TestDataFactory.CreateTreatment(price: 100m);
        var invoiceWithDetails = TestDataFactory.CreateInvoice();
        invoiceWithDetails.TotalAmount = 200m;

        _mockPatientRepo.Setup(r => r.GetByIdAsync(dto.PatientId)).ReturnsAsync(patient);
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(treatment);
        _mockInvoiceRepo.Setup(r => r.AddAsync(It.IsAny<Invoice>()))
            .ReturnsAsync((Invoice inv) => { inv.Id = 1; return inv; });
        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(1)).ReturnsAsync(invoiceWithDetails);

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.PatientId.Should().Be(dto.PatientId);
        result.Status.Should().Be(InvoiceStatus.Pending);
        result.TotalAmount.Should().Be(200m); // 100 * 2
    }

    [Fact]
    public async Task CreateAsync_CalculatesTotalAmountCorrectly()
    {
        // Arrange
        var dto = new CreateInvoiceDto
        {
            PatientId = 1,
            Items = new List<CreateInvoiceItemDto>
            {
                new CreateInvoiceItemDto { TreatmentId = 1, Quantity = 2 },
                new CreateInvoiceItemDto { TreatmentId = 2, Quantity = 1 }
            }
        };
        var patient = TestDataFactory.CreatePatient();
        var treatment1 = TestDataFactory.CreateTreatment(1, "T1", 100m);
        var treatment2 = TestDataFactory.CreateTreatment(2, "T2", 250m);
        var invoiceWithDetails = TestDataFactory.CreateInvoice();

        _mockPatientRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(patient);
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(treatment1);
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(treatment2);

        Invoice? capturedInvoice = null;
        _mockInvoiceRepo.Setup(r => r.AddAsync(It.IsAny<Invoice>()))
            .Callback<Invoice>(inv => capturedInvoice = inv)
            .ReturnsAsync((Invoice inv) => { inv.Id = 1; return inv; });
        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(It.IsAny<int>())).ReturnsAsync(invoiceWithDetails);

        // Act
        await _service.CreateAsync(dto);

        // Assert
        capturedInvoice!.TotalAmount.Should().Be(450m); // (100*2) + (250*1)
    }

    [Fact]
    public async Task CreateAsync_GeneratesInvoiceNumber()
    {
        // Arrange
        var dto = TestDataFactory.CreateInvoiceDto();
        var patient = TestDataFactory.CreatePatient();
        var treatment = TestDataFactory.CreateTreatment();
        var invoiceWithDetails = TestDataFactory.CreateInvoice();

        _mockPatientRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(patient);
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(treatment);

        Invoice? capturedInvoice = null;
        _mockInvoiceRepo.Setup(r => r.AddAsync(It.IsAny<Invoice>()))
            .Callback<Invoice>(inv => capturedInvoice = inv)
            .ReturnsAsync((Invoice inv) => { inv.Id = 1; return inv; });
        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(It.IsAny<int>())).ReturnsAsync(invoiceWithDetails);

        // Act
        await _service.CreateAsync(dto);

        // Assert
        capturedInvoice!.InvoiceNumber.Should().StartWith("INV-");
        capturedInvoice.InvoiceNumber.Should().HaveLength(21); // "INV-yyyyMMdd-XXXXXXXX"
    }

    [Fact]
    public async Task CreateAsync_PatientNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var dto = TestDataFactory.CreateInvoiceDto();
        _mockPatientRepo.Setup(r => r.GetByIdAsync(dto.PatientId)).ReturnsAsync((Patient?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_TreatmentNotFound_ThrowsKeyNotFoundException()
    {
        // Arrange
        var dto = TestDataFactory.CreateInvoiceDto();
        _mockPatientRepo.Setup(r => r.GetByIdAsync(dto.PatientId)).ReturnsAsync(TestDataFactory.CreatePatient());
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((Treatment?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_SetsStatusToPending()
    {
        // Arrange
        var dto = TestDataFactory.CreateInvoiceDto();
        var patient = TestDataFactory.CreatePatient();
        var treatment = TestDataFactory.CreateTreatment();
        var invoiceWithDetails = TestDataFactory.CreateInvoice();

        _mockPatientRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(patient);
        _mockTreatmentRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(treatment);

        Invoice? capturedInvoice = null;
        _mockInvoiceRepo.Setup(r => r.AddAsync(It.IsAny<Invoice>()))
            .Callback<Invoice>(inv => capturedInvoice = inv)
            .ReturnsAsync((Invoice inv) => { inv.Id = 1; return inv; });
        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(It.IsAny<int>())).ReturnsAsync(invoiceWithDetails);

        // Act
        await _service.CreateAsync(dto);

        // Assert
        capturedInvoice!.Status.Should().Be(InvoiceStatus.Pending);
    }

    #endregion

    #region PayAsync

    [Fact]
    public async Task PayAsync_ExistingInvoice_SetsStatusToPaid()
    {
        // Arrange
        var invoice = TestDataFactory.CreateInvoice();
        var dto = new PayInvoiceDto { PaymentMethod = "Cash", Notes = "Paid in full" };

        var paidInvoice = TestDataFactory.CreateInvoice();
        paidInvoice.Status = InvoiceStatus.Paid;
        paidInvoice.PaymentMethod = "Cash";

        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(1)).ReturnsAsync(invoice);
        _mockInvoiceRepo.Setup(r => r.UpdateAsync(It.IsAny<Invoice>()))
            .ReturnsAsync((Invoice inv) => inv)
            .Callback<Invoice>(_ =>
            {
                _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(1)).ReturnsAsync(paidInvoice);
            });

        // Act
        var result = await _service.PayAsync(1, dto);

        // Assert
        result.Status.Should().Be(InvoiceStatus.Paid);
        result.PaymentMethod.Should().Be("Cash");
    }

    [Fact]
    public async Task PayAsync_SetsPaidAtTimestamp()
    {
        // Arrange
        var invoice = TestDataFactory.CreateInvoice();
        var dto = new PayInvoiceDto { PaymentMethod = "Card" };

        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(1)).ReturnsAsync(invoice);
        _mockInvoiceRepo.Setup(r => r.UpdateAsync(It.IsAny<Invoice>()))
            .ReturnsAsync((Invoice inv) => inv)
            .Callback<Invoice>(_ =>
            {
                _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(1)).ReturnsAsync(invoice);
            });

        // Act
        var before = DateTime.UtcNow;
        await _service.PayAsync(1, dto);
        var after = DateTime.UtcNow;

        // Assert
        invoice.PaidAt.Should().NotBeNull();
        invoice.PaidAt!.Value.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    [Fact]
    public async Task PayAsync_NonExistingInvoice_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(999)).ReturnsAsync((Invoice?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.PayAsync(999, new PayInvoiceDto()));
    }

    #endregion

    #region CancelAsync

    [Fact]
    public async Task CancelAsync_ExistingInvoice_SetsStatusToCancelled()
    {
        // Arrange
        var invoice = TestDataFactory.CreateInvoice();
        var cancelledInvoice = TestDataFactory.CreateInvoice();
        cancelledInvoice.Status = InvoiceStatus.Cancelled;

        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(1)).ReturnsAsync(invoice);
        _mockInvoiceRepo.Setup(r => r.UpdateAsync(It.IsAny<Invoice>()))
            .ReturnsAsync((Invoice inv) => inv)
            .Callback<Invoice>(_ =>
            {
                _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(1)).ReturnsAsync(cancelledInvoice);
            });

        // Act
        var result = await _service.CancelAsync(1);

        // Assert
        result.Status.Should().Be(InvoiceStatus.Cancelled);
    }

    [Fact]
    public async Task CancelAsync_NonExistingInvoice_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockInvoiceRepo.Setup(r => r.GetByIdWithItemsAsync(999)).ReturnsAsync((Invoice?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _service.CancelAsync(999));
    }

    #endregion
}
