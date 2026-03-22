# Database Documentation

## Overview

The DentalClinic database uses **Entity Framework Core** with **Code-First migrations**.

## Connection String

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DentalClinic;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

---

## Migrations

### Create Initial Migration
```bash
cd src/DentalClinic.Api
dotnet ef migrations add InitialCreate
```

### Apply Migrations
```bash
dotnet ef database update
```

### Add New Migration
```bash
dotnet ef migrations add AddNewField
dotnet ef database update
```

### Rollback Migration
```bash
dotnet ef database update PreviousMigrationName
```

### Remove Last Migration (if not applied)
```bash
dotnet ef migrations remove
```

---

## Seed Data

### Doctors
```csharp
var doctors = new List<Doctor>
{
    new Doctor { Id = 1, FirstName = "Ahmad", LastName = "Al-Masri", Specialization = "General Dentistry", Phone = "+962790000001", Email = "ahmad@clinic.com", IsAvailable = true },
    new Doctor { Id = 2, FirstName = "Sara", LastName = "Ahmad", Specialization = "Orthodontics", Phone = "+962790000002", Email = "sara@clinic.com", IsAvailable = true },
    new Doctor { Id = 3, FirstName = "Omar", LastName = "Khaleel", Specialization = "Oral Surgery", Phone = "+962790000003", Email = "omar@clinic.com", IsAvailable = true },
    new Doctor { Id = 4, FirstName = "Layla", LastName = "Hassan", Specialization = "Pediatric Dentistry", Phone = "+962790000004", Email = "layla@clinic.com", IsAvailable = true }
};
```

### Treatments
```csharp
var treatments = new List<Treatment>
{
    new Treatment { Id = 1, Name = "Teeth Cleaning", Description = "Professional dental cleaning and polishing", Price = 50.00m, DurationMinutes = 30 },
    new Treatment { Id = 2, Name = "Teeth Whitening", Description = "Professional whitening treatment", Price = 150.00m, DurationMinutes = 60 },
    new Treatment { Id = 3, Name = "Dental Filling", Description = "Composite or amalgam filling", Price = 80.00m, DurationMinutes = 45 },
    new Treatment { Id = 4, Name = "Root Canal", Description = "Endodontic treatment", Price = 300.00m, DurationMinutes = 90 },
    new Treatment { Id = 5, Name = "Dental Crown", Description = "Porcelain or ceramic crown", Price = 500.00m, DurationMinutes = 60 },
    new Treatment { Id = 6, Name = "Braces (Traditional)", Description = "Metal braces installation", Price = 2000.00m, DurationMinutes = 120 },
    new Treatment { Id = 7, Name = "Tooth Extraction", Description = "Simple or surgical extraction", Price = 100.00m, DurationMinutes = 30 },
    new Treatment { Id = 8, Name = "Dental Implant", Description = "Titanium implant placement", Price = 1500.00m, DurationMinutes = 90 }
};
```

---

## Sample Data

### Sample Patients
```csharp
var patients = new List<Patient>
{
    new Patient { Id = 1, FirstName = "John", LastName = "Doe", Phone = "+962790000010", Email = "john@example.com", DateOfBirth = new DateTime(1990, 5, 15), Gender = Gender.Male, Address = "Amman, Jordan" },
    new Patient { Id = 2, FirstName = "Jane", LastName = "Smith", Phone = "+962790000011", Email = "jane@example.com", DateOfBirth = new DateTime(1985, 8, 22), Gender = Gender.Female, Address = "Irbid, Jordan" },
    new Patient { Id = 3, FirstName = "Michael", LastName = "Johnson", Phone = "+962790000012", DateOfBirth = new DateTime(1978, 3, 10), Gender = Gender.Male, Address = "Zarqa, Jordan" }
};
```

### Sample Appointments
```csharp
var appointments = new List<Appointment>
{
    new Appointment 
    { 
        Id = 1, 
        PatientId = 1, 
        DoctorId = 1, 
        AppointmentDate = DateTime.Today.AddDays(1), 
        StartTime = new TimeSpan(9, 0, 0), 
        EndTime = new TimeSpan(9, 30, 0), 
        TreatmentId = 1, 
        Status = AppointmentStatus.Confirmed 
    }
};
```

---

## Indexes

Recommended indexes for performance:

```csharp
// Patients table
modelBuilder.Entity<Patient>()
    .HasIndex(p => p.Phone);

modelBuilder.Entity<Patient>()
    .HasIndex(p => p.LastName);

// Appointments table
modelBuilder.Entity<Appointment>()
    .HasIndex(a => a.AppointmentDate);

modelBuilder.Entity<Appointment>()
    .HasIndex(a => a.DoctorId);

modelBuilder.Entity<Appointment>()
    .HasIndex(a => a.PatientId);

// Invoices table
modelBuilder.Entity<Invoice>()
    .HasIndex(i => i.PatientId);

modelBuilder.Entity<Invoice>()
    .HasIndex(i => i.Status);
```

---

## Backup & Restore

### Backup Database
```sql
BACKUP DATABASE DentalClinic
TO DISK = 'D:\Backups\DentalClinic.bak'
WITH FORMAT, MEDIANAME = 'SQLServerBackups';
```

### Restore Database
```sql
RESTORE DATABASE DentalClinic
FROM DISK = 'D:\Backups\DentalClinic.bak'
WITH REPLACE;
```

---

## Maintenance

### Check Database Size
```sql
EXEC sp_spaceused;
```

### Rebuild Indexes
```sql
ALTER INDEX ALL ON Patients REBUILD;
ALTER INDEX ALL ON Appointments REBUILD;
ALTER INDEX ALL ON Invoices REBUILD;
```

### Update Statistics
```sql
UPDATE STATISTICS Patients;
UPDATE STATISTICS Appointments;
UPDATE STATISTICS Invoices;
```
