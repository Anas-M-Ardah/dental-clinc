using DentalClinic.Application.DTOs;
using DentalClinic.Domain.Enums;

namespace DentalClinic.Application.Interfaces;

public interface IInvoiceService
{
    Task<PagedResultDto<InvoiceDto>> GetAllAsync(int? patientId, InvoiceStatus? status, DateTime? startDate, DateTime? endDate, int pageNumber, int pageSize);
    Task<InvoiceDto?> GetByIdAsync(int id);
    Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto);
    Task<InvoiceDto> PayAsync(int id, PayInvoiceDto dto);
    Task<InvoiceDto> CancelAsync(int id);
}
