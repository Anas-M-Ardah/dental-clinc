# Database Documentation

## Overview

The DentalClinic database uses **Entity Framework Core** with **SQL Server** and **Code-First** approach. Database is auto-created on first run via `EnsureCreated()`.

## Connection String

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DentalClinic;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

---

## Tables

The database contains 7 tables:

| Table | Description |
|-------|-------------|
| Patients | Patient demographics and medical history |
| Doctors | Doctor profiles and availability |
| Appointments | Scheduled visits linking patients, doctors, treatments |
| Treatments | Treatment catalog with pricing |
| TreatmentRecords | Clinical dental records per visit |
| Invoices | Billing records |
| InvoiceItems | Line items within invoices |

> See [DOMAIN_MODEL.md](DOMAIN_MODEL.md) for full schema details.

---

## Database Initialization

The database is automatically created on application startup:
```csharp
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DentalClinicDbContext>();
    context.Database.EnsureCreated();
}
```

Seed data (doctors and treatments) is applied via `SeedData.cs` during `EnsureCreated()`.

---

## Migrations

### Create Migration
```bash
cd src/DentalClinic.Api
dotnet ef migrations add MigrationName
```

### Apply Migrations
```bash
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

### Doctors (4 records)
```csharp
new Doctor { Id = 1, FirstName = "Ahmad", LastName = "Al-Masri", Specialization = "General Dentistry", Phone = "+962790000001", IsAvailable = true },
new Doctor { Id = 2, FirstName = "Sara", LastName = "Ahmad", Specialization = "Orthodontics", Phone = "+962790000002", IsAvailable = true },
new Doctor { Id = 3, FirstName = "Omar", LastName = "Khaleel", Specialization = "Oral Surgery", Phone = "+962790000003", IsAvailable = true },
new Doctor { Id = 4, FirstName = "Layla", LastName = "Hassan", Specialization = "Pediatric Dentistry", Phone = "+962790000004", IsAvailable = true }
```

### Treatments (8 records)
```csharp
new Treatment { Id = 1, Name = "Teeth Cleaning", Price = 50.00m, DurationMinutes = 30 },
new Treatment { Id = 2, Name = "Teeth Whitening", Price = 150.00m, DurationMinutes = 60 },
new Treatment { Id = 3, Name = "Dental Filling", Price = 80.00m, DurationMinutes = 45 },
new Treatment { Id = 4, Name = "Root Canal", Price = 300.00m, DurationMinutes = 90 },
new Treatment { Id = 5, Name = "Dental Crown", Price = 500.00m, DurationMinutes = 60 },
new Treatment { Id = 6, Name = "Braces (Traditional)", Price = 2000.00m, DurationMinutes = 120 },
new Treatment { Id = 7, Name = "Tooth Extraction", Price = 100.00m, DurationMinutes = 30 },
new Treatment { Id = 8, Name = "Dental Implant", Price = 1500.00m, DurationMinutes = 90 }
```

---

## Indexes

Recommended indexes for performance:

```csharp
// Patients
modelBuilder.Entity<Patient>().HasIndex(p => p.Phone);
modelBuilder.Entity<Patient>().HasIndex(p => p.LastName);

// Appointments
modelBuilder.Entity<Appointment>().HasIndex(a => a.AppointmentDate);
modelBuilder.Entity<Appointment>().HasIndex(a => a.DoctorId);
modelBuilder.Entity<Appointment>().HasIndex(a => a.PatientId);

// TreatmentRecords
modelBuilder.Entity<TreatmentRecord>().HasIndex(tr => tr.PatientId);
modelBuilder.Entity<TreatmentRecord>().HasIndex(tr => tr.DoctorId);
modelBuilder.Entity<TreatmentRecord>().HasIndex(tr => tr.VisitDate);

// Invoices
modelBuilder.Entity<Invoice>().HasIndex(i => i.PatientId);
modelBuilder.Entity<Invoice>().HasIndex(i => i.Status);
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
ALTER INDEX ALL ON TreatmentRecords REBUILD;
ALTER INDEX ALL ON Invoices REBUILD;
```
