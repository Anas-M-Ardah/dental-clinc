using Moq;
using FluentAssertions;
using DentalClinic.Application.Services;
using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Interfaces;
using DentalClinic.Tests.Helpers;

namespace DentalClinic.Tests.Services;

public class TreatmentRecordServiceTests
{
    private readonly Mock<ITreatmentRecordRepository> _mockRepo;
    private readonly TreatmentRecordService _service;

    public TreatmentRecordServiceTests()
    {
        _mockRepo = new Mock<ITreatmentRecordRepository>();
        _service = new TreatmentRecordService(_mockRepo.Object);
    }

    #region GetByPatientAsync

    [Fact]
    public async Task GetByPatientAsync_ReturnsRecordsForPatient()
    {
        // Arrange
        var records = new List<TreatmentRecord>
        {
            TestDataFactory.CreateTreatmentRecord(1, patientId: 1),
            TestDataFactory.CreateTreatmentRecord(2, patientId: 1)
        };
        _mockRepo.Setup(r => r.GetByPatientAsync(1)).ReturnsAsync(records);

        // Act
        var result = await _service.GetByPatientAsync(1);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByPatientAsync_NoRecords_ReturnsEmpty()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByPatientAsync(1)).ReturnsAsync(new List<TreatmentRecord>());

        // Act
        var result = await _service.GetByPatientAsync(1);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsRecord()
    {
        // Arrange
        var record = TestDataFactory.CreateTreatmentRecord();
        _mockRepo.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(record);

        // Act
        var result = await _service.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(1);
        result.PatientName.Should().Be("John Doe");
        result.DoctorName.Should().Be("Dr. Sarah Wilson");
        result.ChiefComplaint.Should().Be("Tooth pain");
        result.PainLevel.Should().Be(5);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdWithDetailsAsync(999)).ReturnsAsync((TreatmentRecord?)null);

        // Act
        var result = await _service.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync

    [Fact]
    public async Task CreateAsync_ValidDto_ReturnsCreatedRecord()
    {
        // Arrange
        var dto = TestDataFactory.CreateTreatmentRecordDto();
        var recordWithDetails = TestDataFactory.CreateTreatmentRecord(1, patientId: dto.PatientId, doctorId: dto.DoctorId);

        _mockRepo.Setup(r => r.AddAsync(It.IsAny<TreatmentRecord>()))
            .ReturnsAsync((TreatmentRecord tr) => { tr.Id = 1; return tr; });
        _mockRepo.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(recordWithDetails);

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.ChiefComplaint.Should().Be(recordWithDetails.ChiefComplaint);
        result.PainLevel.Should().Be(recordWithDetails.PainLevel);
        result.PatientId.Should().Be(dto.PatientId);
        result.DoctorId.Should().Be(dto.DoctorId);
    }

    [Fact]
    public async Task CreateAsync_MapsAllFieldsFromDto()
    {
        // Arrange
        var dto = TestDataFactory.CreateTreatmentRecordDto();
        TreatmentRecord? capturedRecord = null;
        var recordWithDetails = TestDataFactory.CreateTreatmentRecord();

        _mockRepo.Setup(r => r.AddAsync(It.IsAny<TreatmentRecord>()))
            .Callback<TreatmentRecord>(tr => capturedRecord = tr)
            .ReturnsAsync((TreatmentRecord tr) => { tr.Id = 1; return tr; });
        _mockRepo.Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<int>())).ReturnsAsync(recordWithDetails);

        // Act
        await _service.CreateAsync(dto);

        // Assert
        capturedRecord.Should().NotBeNull();
        capturedRecord!.ChiefComplaint.Should().Be(dto.ChiefComplaint);
        capturedRecord.PainLevel.Should().Be(dto.PainLevel);
        capturedRecord.SymptomDuration.Should().Be(dto.SymptomDuration);
        capturedRecord.PrimaryDiagnosis.Should().Be(dto.PrimaryDiagnosis);
        capturedRecord.TreatmentPlan.Should().Be(dto.TreatmentPlan);
        capturedRecord.ProcedurePerformed.Should().Be(dto.ProcedurePerformed);
        capturedRecord.AnaesthesiaUsed.Should().Be(dto.AnaesthesiaUsed);
        capturedRecord.Prescriptions.Should().Be(dto.Prescriptions);
        capturedRecord.EstimatedCost.Should().Be(dto.EstimatedCost);
    }

    [Fact]
    public async Task CreateAsync_SetsCreatedAtToUtcNow()
    {
        // Arrange
        var dto = TestDataFactory.CreateTreatmentRecordDto();
        TreatmentRecord? capturedRecord = null;
        var recordWithDetails = TestDataFactory.CreateTreatmentRecord();

        _mockRepo.Setup(r => r.AddAsync(It.IsAny<TreatmentRecord>()))
            .Callback<TreatmentRecord>(tr => capturedRecord = tr)
            .ReturnsAsync((TreatmentRecord tr) => { tr.Id = 1; return tr; });
        _mockRepo.Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<int>())).ReturnsAsync(recordWithDetails);

        // Act
        var before = DateTime.UtcNow;
        await _service.CreateAsync(dto);
        var after = DateTime.UtcNow;

        // Assert
        capturedRecord!.CreatedAt.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    #endregion

    #region UpdateAsync

    [Fact]
    public async Task UpdateAsync_ExistingRecord_ReturnsUpdated()
    {
        // Arrange
        var record = TestDataFactory.CreateTreatmentRecord();
        var dto = TestDataFactory.UpdateTreatmentRecordDto();

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(record);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<TreatmentRecord>()))
            .ReturnsAsync((TreatmentRecord tr) => tr);

        var updatedRecord = TestDataFactory.CreateTreatmentRecord();
        updatedRecord.ChiefComplaint = dto.ChiefComplaint;
        updatedRecord.PainLevel = dto.PainLevel;
        updatedRecord.Notes = dto.Notes;
        _mockRepo.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(updatedRecord);

        // Act
        var result = await _service.UpdateAsync(1, dto);

        // Assert
        result.ChiefComplaint.Should().Be(dto.ChiefComplaint);
        result.PainLevel.Should().Be(dto.PainLevel);
        result.Notes.Should().Be(dto.Notes);
    }

    [Fact]
    public async Task UpdateAsync_NonExistingRecord_ThrowsKeyNotFoundException()
    {
        // Arrange
        _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((TreatmentRecord?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _service.UpdateAsync(999, TestDataFactory.UpdateTreatmentRecordDto()));
    }

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAtToUtcNow()
    {
        // Arrange
        var record = TestDataFactory.CreateTreatmentRecord();
        var dto = TestDataFactory.UpdateTreatmentRecordDto();

        _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(record);
        _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<TreatmentRecord>()))
            .ReturnsAsync((TreatmentRecord tr) => tr);
        _mockRepo.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(record);

        // Act
        var before = DateTime.UtcNow;
        await _service.UpdateAsync(1, dto);
        var after = DateTime.UtcNow;

        // Assert
        record.UpdatedAt.Should().NotBeNull();
        record.UpdatedAt!.Value.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    #endregion

    #region DeleteAsync

    [Fact]
    public async Task DeleteAsync_CallsRepositoryDelete()
    {
        // Act
        await _service.DeleteAsync(1);

        // Assert
        _mockRepo.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    #endregion
}
