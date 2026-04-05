using DentalClinic.Domain.Entities;
using DentalClinic.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DentalClinic.Infrastructure.Data;

public static class SeedData
{
    private static readonly DateTime SeedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Doctor>().HasData(
            new Doctor { Id = 1, FirstName = "Ahmad", LastName = "Al-Masri", Specialization = "General Dentistry", Phone = "+962790000001", Email = "ahmad@clinic.com", IsAvailable = true, CreatedAt = SeedDate },
            new Doctor { Id = 2, FirstName = "Sara", LastName = "Ahmad", Specialization = "Orthodontics", Phone = "+962790000002", Email = "sara@clinic.com", IsAvailable = true, CreatedAt = SeedDate },
            new Doctor { Id = 3, FirstName = "Omar", LastName = "Khaleel", Specialization = "Oral Surgery", Phone = "+962790000003", Email = "omar@clinic.com", IsAvailable = true, CreatedAt = SeedDate },
            new Doctor { Id = 4, FirstName = "Layla", LastName = "Hassan", Specialization = "Pediatric Dentistry", Phone = "+962790000004", Email = "layla@clinic.com", IsAvailable = true, CreatedAt = SeedDate }
        );

        modelBuilder.Entity<Treatment>().HasData(
            new Treatment { Id = 1, Name = "Teeth Cleaning", Description = "Professional dental cleaning and polishing", Price = 50.00m, DurationMinutes = 30, IsActive = true, CreatedAt = SeedDate },
            new Treatment { Id = 2, Name = "Teeth Whitening", Description = "Professional whitening treatment", Price = 150.00m, DurationMinutes = 60, IsActive = true, CreatedAt = SeedDate },
            new Treatment { Id = 3, Name = "Dental Filling", Description = "Composite or amalgam filling", Price = 80.00m, DurationMinutes = 45, IsActive = true, CreatedAt = SeedDate },
            new Treatment { Id = 4, Name = "Root Canal", Description = "Endodontic treatment", Price = 300.00m, DurationMinutes = 90, IsActive = true, CreatedAt = SeedDate },
            new Treatment { Id = 5, Name = "Dental Crown", Description = "Porcelain or ceramic crown", Price = 500.00m, DurationMinutes = 60, IsActive = true, CreatedAt = SeedDate },
            new Treatment { Id = 6, Name = "Braces (Traditional)", Description = "Metal braces installation", Price = 2000.00m, DurationMinutes = 120, IsActive = true, CreatedAt = SeedDate },
            new Treatment { Id = 7, Name = "Tooth Extraction", Description = "Simple or surgical extraction", Price = 100.00m, DurationMinutes = 30, IsActive = true, CreatedAt = SeedDate },
            new Treatment { Id = 8, Name = "Dental Implant", Description = "Titanium implant placement", Price = 1500.00m, DurationMinutes = 90, IsActive = true, CreatedAt = SeedDate }
        );
    }
}
