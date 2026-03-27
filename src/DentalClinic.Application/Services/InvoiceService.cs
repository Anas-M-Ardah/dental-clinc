using System.Linq;
using DentalClinic.Application.DTOs;
using DentalClinic.Application.Interfaces;
using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using DentalClinic.Domain.Interfaces;

namespace DentalClinic.Application.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly ITreatmentRepository _treatmentRepository;

    public InvoiceService(
        IInvoiceRepository invoiceRepository,
        IPatientRepository patientRepository,
        ITreatmentRepository treatmentRepository)
    {
        _invoiceRepository = invoiceRepository;
        _patientRepository = patientRepository;
        _treatmentRepository = treatmentRepository;
    }

    public async Task<PagedResultDto<InvoiceDto>> GetAllAsync(int? patientId, InvoiceStatus? status, DateTime? startDate, DateTime? endDate, int pageNumber, int pageSize)
    {
        var invoices = await _invoiceRepository.GetFilteredAsync(patientId, status, startDate, endDate);
        
        var totalCount = invoices.Count();
        var pagedInvoices = invoices
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PagedResultDto<InvoiceDto>
        {
            Data = pagedInvoices.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<InvoiceDto?> GetByIdAsync(int id)
    {
        var invoice = await _invoiceRepository.GetByIdWithItemsAsync(id);
        return invoice == null ? null : MapToDto(invoice);
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto)
    {
        var patient = await _patientRepository.GetByIdAsync(dto.PatientId);
        if (patient == null)
            throw new KeyNotFoundException("Patient not found");

        var invoiceNumber = GenerateInvoiceNumber();
        var totalAmount = 0m;

        var items = new List<InvoiceItem>();
        foreach (var item in dto.Items)
        {
            var treatment = await _treatmentRepository.GetByIdAsync(item.TreatmentId);
            if (treatment == null)
                throw new KeyNotFoundException($"Treatment with ID {item.TreatmentId} not found");

            var itemTotal = treatment.Price * item.Quantity;
            totalAmount += itemTotal;

            items.Add(new InvoiceItem
            {
                TreatmentId = item.TreatmentId,
                Quantity = item.Quantity,
                UnitPrice = treatment.Price,
                TotalPrice = itemTotal
            });
        }

        var invoice = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            PatientId = dto.PatientId,
            AppointmentId = dto.AppointmentId,
            TotalAmount = totalAmount,
            Status = InvoiceStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Items = items
        };

        var created = await _invoiceRepository.AddAsync(invoice);
        return MapToDto(created);
    }

    public async Task<InvoiceDto> PayAsync(int id, PayInvoiceDto dto)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
            throw new KeyNotFoundException("Invoice not found");

        invoice.Status = InvoiceStatus.Paid;
        invoice.PaymentMethod = dto.PaymentMethod;
        invoice.Notes = dto.Notes;
        invoice.PaidAt = DateTime.UtcNow;

        var updated = await _invoiceRepository.UpdateAsync(invoice);
        return MapToDto(updated);
    }

    public async Task<InvoiceDto> CancelAsync(int id)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
            throw new KeyNotFoundException("Invoice not found");

        invoice.Status = InvoiceStatus.Cancelled;

        var updated = await _invoiceRepository.UpdateAsync(invoice);
        return MapToDto(updated);
    }

    private static InvoiceDto MapToDto(Invoice invoice)
    {
        return new InvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            PatientId = invoice.PatientId,
            PatientName = $"{invoice.Patient.FirstName} {invoice.Patient.LastName}",
            AppointmentId = invoice.AppointmentId,
            TotalAmount = invoice.TotalAmount,
            Status = invoice.Status,
            PaymentMethod = invoice.PaymentMethod,
            Notes = invoice.Notes,
            CreatedAt = invoice.CreatedAt,
            PaidAt = invoice.PaidAt,
            Items = invoice.Items.Select(i => new InvoiceItemDto
            {
                Id = i.Id,
                TreatmentName = i.Treatment.Name,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }

    private static string GenerateInvoiceNumber()
    {
        return $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }
}
