# Dental Clinic - Architecture Documentation

## Overview

This project follows **Clean Architecture** principles to ensure maintainability, testability, and separation of concerns.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│                    (ASP.NET Core API)                       │
├─────────────────────────────────────────────────────────────┤
│                     Application Layer                       │
│              (Use Cases, Services, DTOs)                    │
├─────────────────────────────────────────────────────────────┤
│                       Domain Layer                           │
│            (Entities, Enums, Interfaces)                    │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│         (Database, Repositories, External Services)         │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Domain Layer (`DentalClinic.Domain`)
- **Contains**: Core business entities, enums, interfaces
- **No dependencies**: This layer has no external dependencies
- **Entities**: Patient, Doctor, Appointment, Treatment, Invoice, InvoiceItem

### Application Layer (`DentalClinic.Application`)
- **Contains**: Business logic, use cases, DTOs, interfaces
- **Depends on**: Domain layer only
- **Services**: PatientService, AppointmentService, DoctorService, InvoiceService

### Infrastructure Layer (`DentalClinic.Infrastructure`)
- **Contains**: Database context, repositories, migrations
- **Depends on**: Domain and Application layers
- **Implements**: Repository interfaces defined in Domain

### Presentation Layer (`DentalClinic.Api`)
- **Contains**: REST API controllers, middleware, configuration
- **Depends on**: All layers
- **Entry point**: ASP.NET Core Web API

## Data Flow

```
HTTP Request
    ↓
API Controller
    ↓
Application Service (Use Case)
    ↓
Domain Entity / Business Logic
    ↓
Repository Interface
    ↓
Repository Implementation (Infrastructure)
    ↓
Entity Framework Core
    ↓
SQL Server Database
```

## Key Principles

1. **Dependency Rule**: Inner layers never depend on outer layers
2. **Single Responsibility**: Each layer has one job
3. **Interface Segregation**: Dependencies are defined as interfaces
4. **Database Agnostic**: Domain logic has no database concerns

## Cross-Cutting Concerns

- **Validation**: FluentValidation in Application layer
- **Error Handling**: Global exception middleware in API layer
- **Logging**: Serilog configuration in API layer
