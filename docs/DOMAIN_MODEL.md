# Domain Model

## Entities

### Patient
```csharp
public class Patient
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string? Address { get; set; }
    public string? MedicalHistory { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    public virtual ICollection<Appointment> Appointments { get; set; }
    public virtual ICollection<Invoice> Invoices { get; set; }
}
```

### Doctor
```csharp
public class Doctor
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Bio { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Navigation Properties
    public virtual ICollection<Appointment> Appointments { get; set; }
}
```

### Appointment
```csharp
public class Appointment
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int TreatmentId { get; set; }
    public string? Notes { get; set; }
    public AppointmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    public virtual Patient Patient { get; set; }
    public virtual Doctor Doctor { get; set; }
    public virtual Treatment Treatment { get; set; }
    public virtual Invoice? Invoice { get; set; }
}
```

### Treatment
```csharp
public class Treatment
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Navigation Properties
    public virtual ICollection<Appointment> Appointments { get; set; }
    public virtual ICollection<InvoiceItem> InvoiceItems { get; set; }
}
```

### TreatmentRecord
```csharp
public class TreatmentRecord
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int? AppointmentId { get; set; }

    public DateTime VisitDate { get; set; }

    // Chief Complaint
    public string ChiefComplaint { get; set; } = string.Empty;
    public int PainLevel { get; set; }              // 0-10 NRS
    public string SymptomDuration { get; set; } = string.Empty;

    // Clinical Examination
    public string ExtraoralFindings { get; set; } = string.Empty;
    public string IntraoralFindings { get; set; } = string.Empty;
    public string TeethCondition { get; set; } = string.Empty;   // e.g., "#19 MOD (Tooth)"
    public string GumCondition { get; set; } = string.Empty;
    public string RadiographicFindings { get; set; } = string.Empty;

    // Diagnosis
    public string PrimaryDiagnosis { get; set; } = string.Empty;    // ICD-10 coded
    public string SecondaryDiagnoses { get; set; } = string.Empty;

    // Treatment Plan
    public string TreatmentPlan { get; set; } = string.Empty;
    public string TreatmentStages { get; set; } = string.Empty;
    public decimal EstimatedCost { get; set; }

    // Procedure
    public string ProcedurePerformed { get; set; } = string.Empty;  // CDT coded
    public string AnaesthesiaUsed { get; set; } = string.Empty;     // Composed: type | technique | carpules
    public string MaterialsUsed { get; set; } = string.Empty;
    public string Complications { get; set; } = string.Empty;
    public int ProcedureDurationMinutes { get; set; }

    // Post-Treatment
    public string Prescriptions { get; set; } = string.Empty;
    public string PostTreatmentInstructions { get; set; } = string.Empty;

    // Follow-up
    public DateTime? NextAppointmentDate { get; set; }
    public int RecallPeriodDays { get; set; }

    public string Notes { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation Properties
    public virtual Patient Patient { get; set; } = null!;
    public virtual Doctor Doctor { get; set; } = null!;
    public virtual Appointment? Appointment { get; set; }
}
```

> **Design Note**: All TreatmentRecord clinical fields are stored as `string`. The frontend uses structured dropdowns (tooth numbers, diagnoses, procedures, materials, anaesthesia types) but composes them into plain strings before saving. This avoids backend schema changes when adding new dropdown options.

### Invoice
```csharp
public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int PatientId { get; set; }
    public int? AppointmentId { get; set; }
    public decimal TotalAmount { get; set; }
    public InvoiceStatus Status { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }

    // Navigation Properties
    public virtual Patient Patient { get; set; }
    public virtual Appointment? Appointment { get; set; }
    public virtual ICollection<InvoiceItem> Items { get; set; }
}
```

### InvoiceItem
```csharp
public class InvoiceItem
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int TreatmentId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    // Navigation Properties
    public virtual Invoice Invoice { get; set; }
    public virtual Treatment Treatment { get; set; }
}
```

---

## Enums

### Gender
```csharp
public enum Gender
{
    Male = 0,
    Female = 1
}
```

### AppointmentStatus
```csharp
public enum AppointmentStatus
{
    Pending = 0,
    Confirmed = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4,
    NoShow = 5
}
```

### InvoiceStatus
```csharp
public enum InvoiceStatus
{
    Pending = 0,
    Paid = 1,
    Cancelled = 2,
    Refunded = 3
}
```

---

## Entity Relationships

```
Patient (1) ─────< (N) Appointment
Doctor (1) ──────< (N) Appointment
Treatment (1) ───< (N) Appointment
Treatment (1) ───< (N) InvoiceItem

Patient (1) ─────< (N) Invoice
Appointment (1) ─< (0..1) Invoice
Invoice (1) ─────< (N) InvoiceItem

Patient (1) ─────< (N) TreatmentRecord
Doctor (1) ──────< (N) TreatmentRecord
Appointment (1) ─< (0..1) TreatmentRecord
```

---

## Database Schema

### Patients Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK, IDENTITY |
| FirstName | nvarchar(100) | NOT NULL |
| LastName | nvarchar(100) | NOT NULL |
| Phone | nvarchar(20) | NOT NULL |
| Email | nvarchar(100) | NULLABLE |
| DateOfBirth | datetime2 | NOT NULL |
| Gender | int | NOT NULL |
| Address | nvarchar(500) | NULLABLE |
| MedicalHistory | nvarchar(max) | NULLABLE |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULLABLE |

### Doctors Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK, IDENTITY |
| FirstName | nvarchar(100) | NOT NULL |
| LastName | nvarchar(100) | NOT NULL |
| Specialization | nvarchar(100) | NOT NULL |
| Phone | nvarchar(20) | NOT NULL |
| Email | nvarchar(100) | NULLABLE |
| Bio | nvarchar(max) | NULLABLE |
| IsAvailable | bit | NOT NULL DEFAULT 1 |
| CreatedAt | datetime2 | NOT NULL |

### Treatments Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK, IDENTITY |
| Name | nvarchar(200) | NOT NULL |
| Description | nvarchar(max) | NULLABLE |
| Price | decimal(18,2) | NOT NULL |
| DurationMinutes | int | NOT NULL |
| IsActive | bit | NOT NULL DEFAULT 1 |
| CreatedAt | datetime2 | NOT NULL |

### Appointments Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK, IDENTITY |
| PatientId | int | FK -> Patients |
| DoctorId | int | FK -> Doctors |
| AppointmentDate | date | NOT NULL |
| StartTime | time | NOT NULL |
| EndTime | time | NOT NULL |
| TreatmentId | int | FK -> Treatments |
| Notes | nvarchar(max) | NULLABLE |
| Status | int | NOT NULL DEFAULT 0 |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULLABLE |

### TreatmentRecords Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK, IDENTITY |
| PatientId | int | FK -> Patients |
| DoctorId | int | FK -> Doctors |
| AppointmentId | int | FK -> Appointments, NULLABLE |
| VisitDate | datetime2 | NOT NULL |
| ChiefComplaint | nvarchar(max) | NOT NULL |
| PainLevel | int | NOT NULL |
| SymptomDuration | nvarchar(max) | NOT NULL |
| ExtraoralFindings | nvarchar(max) | NOT NULL |
| IntraoralFindings | nvarchar(max) | NOT NULL |
| TeethCondition | nvarchar(max) | NOT NULL |
| GumCondition | nvarchar(max) | NOT NULL |
| RadiographicFindings | nvarchar(max) | NOT NULL |
| PrimaryDiagnosis | nvarchar(max) | NOT NULL |
| SecondaryDiagnoses | nvarchar(max) | NOT NULL |
| TreatmentPlan | nvarchar(max) | NOT NULL |
| TreatmentStages | nvarchar(max) | NOT NULL |
| EstimatedCost | decimal(18,2) | NOT NULL |
| ProcedurePerformed | nvarchar(max) | NOT NULL |
| AnaesthesiaUsed | nvarchar(max) | NOT NULL |
| MaterialsUsed | nvarchar(max) | NOT NULL |
| Complications | nvarchar(max) | NOT NULL |
| ProcedureDurationMinutes | int | NOT NULL |
| Prescriptions | nvarchar(max) | NOT NULL |
| PostTreatmentInstructions | nvarchar(max) | NOT NULL |
| NextAppointmentDate | datetime2 | NULLABLE |
| RecallPeriodDays | int | NOT NULL |
| Notes | nvarchar(max) | NOT NULL |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULLABLE |

### Invoices Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK, IDENTITY |
| InvoiceNumber | nvarchar(50) | NOT NULL, UNIQUE |
| PatientId | int | FK -> Patients |
| AppointmentId | int | FK -> Appointments, NULLABLE |
| TotalAmount | decimal(18,2) | NOT NULL |
| Status | int | NOT NULL DEFAULT 0 |
| PaymentMethod | nvarchar(50) | NULLABLE |
| Notes | nvarchar(max) | NULLABLE |
| CreatedAt | datetime2 | NOT NULL |
| PaidAt | datetime2 | NULLABLE |

### InvoiceItems Table
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK, IDENTITY |
| InvoiceId | int | FK -> Invoices |
| TreatmentId | int | FK -> Treatments |
| Quantity | int | NOT NULL |
| UnitPrice | decimal(18,2) | NOT NULL |
| TotalPrice | decimal(18,2) | NOT NULL |

---

## Seed Data

### Doctors
| Id | FirstName | LastName | Specialization | Phone |
|----|-----------|----------|----------------|-------|
| 1 | Ahmad | Al-Masri | General Dentistry | +962790000001 |
| 2 | Sara | Ahmad | Orthodontics | +962790000002 |
| 3 | Omar | Khaleel | Oral Surgery | +962790000003 |
| 4 | Layla | Hassan | Pediatric Dentistry | +962790000004 |

### Treatments
| Id | Name | Price | Duration |
|----|------|-------|----------|
| 1 | Teeth Cleaning | 50.00 | 30 min |
| 2 | Teeth Whitening | 150.00 | 60 min |
| 3 | Dental Filling | 80.00 | 45 min |
| 4 | Root Canal | 300.00 | 90 min |
| 5 | Dental Crown | 500.00 | 60 min |
| 6 | Braces (Traditional) | 2000.00 | 120 min |
| 7 | Tooth Extraction | 100.00 | 30 min |
| 8 | Dental Implant | 1500.00 | 90 min |
