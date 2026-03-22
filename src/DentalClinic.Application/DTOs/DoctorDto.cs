namespace DentalClinic.Application.DTOs;

public class DoctorDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Bio { get; set; }
    public bool IsAvailable { get; set; }
}

public class DoctorScheduleDto
{
    public int DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public List<AppointmentDto> Appointments { get; set; } = new();
}
