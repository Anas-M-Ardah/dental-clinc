using System.ComponentModel.DataAnnotations;

namespace DentalClinic.Application.DTOs;

public class TreatmentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
    public bool IsActive { get; set; }
}

public class CreateTreatmentDto
{
    [Required, StringLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required, Range(0.01, 100000)]
    public decimal Price { get; set; }

    [Required, Range(5, 480)]
    public int DurationMinutes { get; set; }
}
