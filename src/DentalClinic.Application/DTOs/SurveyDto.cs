using System.ComponentModel.DataAnnotations;

namespace DentalClinic.Application.DTOs;

public class PatientSurveyDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int AppointmentId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public int OverallRating { get; set; }
    public int? StaffRating { get; set; }
    public int? CleanlinessRating { get; set; }
    public int? WaitTimeRating { get; set; }
    public string? Comments { get; set; }
    public bool WouldRecommend { get; set; }
    public DateTime SubmittedAt { get; set; }
}

public class CreateSurveyDto
{
    [Required, Range(1, int.MaxValue)]
    public int AppointmentId { get; set; }

    [Required, Range(1, 5)]
    public int OverallRating { get; set; }

    [Range(1, 5)]
    public int? StaffRating { get; set; }

    [Range(1, 5)]
    public int? CleanlinessRating { get; set; }

    [Range(1, 5)]
    public int? WaitTimeRating { get; set; }

    [StringLength(1000)]
    public string? Comments { get; set; }

    public bool WouldRecommend { get; set; }
}
