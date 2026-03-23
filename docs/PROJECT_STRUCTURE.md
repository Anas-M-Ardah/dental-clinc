# Project Structure

## Backend (.NET 9 / ASP.NET Core)

```
DentalClinic/
├── src/
│   ├── DentalClinic.Domain/
│   │   ├── Entities/
│   │   │   ├── Patient.cs
│   │   │   ├── Doctor.cs
│   │   │   ├── Appointment.cs
│   │   │   ├── Treatment.cs
│   │   │   ├── TreatmentRecord.cs
│   │   │   ├── Invoice.cs
│   │   │   └── InvoiceItem.cs
│   │   ├── Enums/
│   │   │   ├── AppointmentStatus.cs
│   │   │   ├── InvoiceStatus.cs
│   │   │   └── Gender.cs
│   │   ├── Interfaces/
│   │   │   ├── IPatientRepository.cs
│   │   │   ├── IDoctorRepository.cs
│   │   │   ├── IAppointmentRepository.cs
│   │   │   ├── ITreatmentRepository.cs
│   │   │   ├── ITreatmentRecordRepository.cs
│   │   │   └── IInvoiceRepository.cs
│   │   └── DentalClinic.Domain.csproj
│   │
│   ├── DentalClinic.Application/
│   │   ├── DTOs/
│   │   │   ├── PatientDto.cs
│   │   │   ├── DoctorDto.cs
│   │   │   ├── AppointmentDto.cs
│   │   │   ├── TreatmentDto.cs
│   │   │   ├── TreatmentRecordDto.cs
│   │   │   ├── InvoiceDto.cs
│   │   │   └── DashboardDto.cs
│   │   ├── Interfaces/
│   │   │   ├── IPatientService.cs
│   │   │   ├── IDoctorService.cs
│   │   │   ├── IAppointmentService.cs
│   │   │   ├── ITreatmentService.cs
│   │   │   ├── ITreatmentRecordService.cs
│   │   │   ├── IInvoiceService.cs
│   │   │   └── IDashboardService.cs
│   │   ├── Services/
│   │   │   ├── PatientService.cs
│   │   │   ├── DoctorService.cs
│   │   │   ├── AppointmentService.cs
│   │   │   ├── TreatmentService.cs
│   │   │   ├── TreatmentRecordService.cs
│   │   │   ├── InvoiceService.cs
│   │   │   └── DashboardService.cs
│   │   └── DentalClinic.Application.csproj
│   │
│   ├── DentalClinic.Infrastructure/
│   │   ├── Data/
│   │   │   ├── DentalClinicDbContext.cs
│   │   │   └── SeedData.cs
│   │   ├── Repositories/
│   │   │   ├── PatientRepository.cs
│   │   │   ├── DoctorRepository.cs
│   │   │   ├── AppointmentRepository.cs
│   │   │   ├── TreatmentRepository.cs
│   │   │   ├── TreatmentRecordRepository.cs
│   │   │   └── InvoiceRepository.cs
│   │   └── DentalClinic.Infrastructure.csproj
│   │
│   └── DentalClinic.Api/
│       ├── Controllers/
│       │   ├── PatientsController.cs
│       │   ├── DoctorsController.cs
│       │   ├── AppointmentsController.cs
│       │   ├── TreatmentsController.cs
│       │   ├── TreatmentRecordsController.cs
│       │   ├── InvoicesController.cs
│       │   └── DashboardController.cs
│       ├── Middleware/
│       │   └── ExceptionHandlingMiddleware.cs
│       ├── Program.cs
│       ├── appsettings.json
│       └── DentalClinic.Api.csproj
│
├── DentalClinic.sln
├── docs/
│   ├── ANGULAR_STRUCTURE.md
│   ├── API_ENDPOINTS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DOMAIN_MODEL.md
│   ├── NAMING_CONVENTIONS.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SETUP.md
│   └── TODOS.md
└── README.md
```

## Frontend (Angular 19)

```
dental-clinic-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts          # Unified HTTP client
│   │   │   │   └── translation.service.ts  # EN/AR bilingual support
│   │   │   └── models/
│   │   │       ├── patient.model.ts
│   │   │       ├── doctor.model.ts
│   │   │       ├── appointment.model.ts
│   │   │       ├── treatment.model.ts
│   │   │       ├── treatment-record.model.ts
│   │   │       └── invoice.model.ts
│   │   │
│   │   ├── shared/
│   │   │   └── pipes/
│   │   │       └── translate.pipe.ts
│   │   │
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.component.ts
│   │   │   ├── patients/
│   │   │   │   ├── patients.component.ts
│   │   │   │   └── patient-form.component.ts
│   │   │   ├── appointments/
│   │   │   │   ├── appointments.component.ts
│   │   │   │   └── appointment-form.component.ts
│   │   │   ├── doctors/
│   │   │   │   └── doctors.component.ts
│   │   │   ├── treatments/
│   │   │   │   └── treatments.component.ts
│   │   │   ├── billing/
│   │   │   │   └── billing.component.ts
│   │   │   └── treatment-records/
│   │   │       └── treatment-records.component.ts
│   │   │
│   │   ├── layouts/
│   │   │   └── main-layout/
│   │   │       └── main-layout.component.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── styles.css          # Global styles & design system
│   ├── index.html
│   └── main.ts
│
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
└── angular.json
```

## Solution Structure

```
DentalClinic.sln
├── DentalClinic.Domain.csproj        (net9.0)
├── DentalClinic.Application.csproj   (net9.0)
├── DentalClinic.Infrastructure.csproj (net9.0)
└── DentalClinic.Api.csproj           (net9.0)
```

## Key Architectural Decisions

- **Standalone Components**: No NgModules; all components are standalone with inline templates and styles
- **Single ApiService**: One unified service handles all HTTP calls instead of separate services per entity
- **Inline Templates**: All component templates and styles are defined inline (not separate files)
- **CSS Custom Properties**: Design system uses CSS variables for theming (Inter font, Indigo primary)
- **Bilingual Support**: TranslationService provides EN/AR with RTL layout support
- **Clean Architecture**: Backend follows 4-layer Clean Architecture (Domain, Application, Infrastructure, API)
