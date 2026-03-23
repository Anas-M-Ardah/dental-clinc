# Dental Clinic - Architecture Documentation

## Overview

This project follows **Clean Architecture** principles with a **.NET 9** backend and **Angular 19** frontend.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│              (ASP.NET Core Web API + Angular 19)            │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                       │
│              (Use Cases, Services, DTOs)                    │
├─────────────────────────────────────────────────────────────┤
│                       Domain Layer                           │
│            (Entities, Enums, Interfaces)                    │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│         (Database, Repositories, EF Core)                   │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Domain Layer (`DentalClinic.Domain`)
- **Contains**: Core business entities, enums, repository interfaces
- **No dependencies**: This layer has no external dependencies
- **Entities**: Patient, Doctor, Appointment, Treatment, TreatmentRecord, Invoice, InvoiceItem

### Application Layer (`DentalClinic.Application`)
- **Contains**: Business logic, services, DTOs, service interfaces
- **Depends on**: Domain layer only
- **Services**: PatientService, DoctorService, AppointmentService, TreatmentService, TreatmentRecordService, InvoiceService, DashboardService

### Infrastructure Layer (`DentalClinic.Infrastructure`)
- **Contains**: Database context (`DentalClinicDbContext`), repository implementations, seed data
- **Depends on**: Domain and Application layers
- **Implements**: Repository interfaces defined in Domain
- **ORM**: Entity Framework Core with SQL Server provider

### Presentation Layer
- **Backend** (`DentalClinic.Api`): REST API controllers, exception handling middleware, CORS config, DI setup
- **Frontend** (`dental-clinic-frontend`): Angular 19 SPA with standalone components

## Data Flow

```
Angular Component
    ↓
ApiService (HttpClient)
    ↓
HTTP Request (http://localhost:7000/api/...)
    ↓
API Controller
    ↓
Application Service
    ↓
Repository Interface → Repository Implementation
    ↓
Entity Framework Core (DbContext)
    ↓
SQL Server Database
```

## Key Principles

1. **Dependency Rule**: Inner layers never depend on outer layers
2. **Single Responsibility**: Each layer has one job
3. **Interface Segregation**: Dependencies defined as interfaces in Domain, implemented in Infrastructure
4. **Database Agnostic**: Domain logic has no database concerns

## Cross-Cutting Concerns

- **Error Handling**: `ExceptionHandlingMiddleware` in API layer (global try-catch with structured error responses)
- **CORS**: Configured in `Program.cs` to allow Angular frontend (`http://localhost:4200`)
- **Seed Data**: `SeedData.cs` seeds doctors and treatments on first run via `EnsureCreated()`
- **Swagger**: Auto-generated API documentation (development only)

## Frontend Architecture

- **Standalone Components**: No NgModules; all components self-declare imports
- **Unified ApiService**: Single service handles all HTTP calls (no per-entity services)
- **TranslationService**: Bilingual EN/AR with RTL support, `TranslatePipe` for templates
- **Design System**: CSS custom properties for consistent theming (Inter font, Indigo primary `#4f46e5`)
- **RxJS**: `takeUntil` pattern for subscription cleanup, `debounceTime` for search

## Dependency Injection

All services and repositories are registered as **Scoped** in `Program.cs`:
```csharp
// Repositories
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<ITreatmentRepository, TreatmentRepository>();
builder.Services.AddScoped<ITreatmentRecordRepository, TreatmentRecordRepository>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();

// Services
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<ITreatmentService, TreatmentService>();
builder.Services.AddScoped<ITreatmentRecordService, TreatmentRecordService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
```
