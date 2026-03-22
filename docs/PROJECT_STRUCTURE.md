# Project Structure

## Backend (ASP.NET Core)

```
DentalClinic/
├── src/
│   ├── DentalClinic.Domain/
│   │   ├── Entities/
│   │   │   ├── Patient.cs
│   │   │   ├── Doctor.cs
│   │   │   ├── Appointment.cs
│   │   │   ├── Treatment.cs
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
│   │   │   └── IInvoiceRepository.cs
│   │   └── DentalClinic.Domain.csproj
│   │
│   ├── DentalClinic.Application/
│   │   ├── DTOs/
│   │   │   ├── PatientDto.cs
│   │   │   ├── DoctorDto.cs
│   │   │   ├── AppointmentDto.cs
│   │   │   ├── TreatmentDto.cs
│   │   │   ├── InvoiceDto.cs
│   │   │   └── DashboardDto.cs
│   │   ├── Interfaces/
│   │   │   ├── IPatientService.cs
│   │   │   ├── IDoctorService.cs
│   │   │   ├── IAppointmentService.cs
│   │   │   ├── ITreatmentService.cs
│   │   │   ├── IInvoiceService.cs
│   │   │   └── IDashboardService.cs
│   │   ├── Services/
│   │   │   ├── PatientService.cs
│   │   │   ├── DoctorService.cs
│   │   │   ├── AppointmentService.cs
│   │   │   ├── TreatmentService.cs
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
│   │   │   └── InvoiceRepository.cs
│   │   └── DentalClinic.Infrastructure.csproj
│   │
│   └── DentalClinic.Api/
│       ├── Controllers/
│       │   ├── PatientsController.cs
│       │   ├── DoctorsController.cs
│       │   ├── AppointmentsController.cs
│       │   ├── TreatmentsController.cs
│       │   ├── InvoicesController.cs
│       │   └── DashboardController.cs
│       ├── Middleware/
│       │   └── ExceptionMiddleware.cs
│       ├── Program.cs
│       ├── appsettings.json
│       └── DentalClinic.Api.csproj
│
├── DentalClinic.sln
└── README.md
```

## Frontend (Angular)

```
dental-clinic-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── patient.service.ts
│   │   │   │   ├── doctor.service.ts
│   │   │   │   ├── appointment.service.ts
│   │   │   │   ├── treatment.service.ts
│   │   │   │   ├── invoice.service.ts
│   │   │   │   └── dashboard.service.ts
│   │   │   ├── models/
│   │   │   │   ├── patient.model.ts
│   │   │   │   ├── doctor.model.ts
│   │   │   │   ├── appointment.model.ts
│   │   │   │   ├── treatment.model.ts
│   │   │   │   └── invoice.model.ts
│   │   │   └── core.module.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── header/
│   │   │   │   └── confirm-dialog/
│   │   │   ├── pipes/
│   │   │   │   └── status-badge.pipe.ts
│   │   │   └── shared.module.ts
│   │   │
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   └── dashboard.module.ts
│   │   │   ├── patients/
│   │   │   │   ├── patient-list/
│   │   │   │   ├── patient-form/
│   │   │   │   └── patients.module.ts
│   │   │   ├── appointments/
│   │   │   │   ├── appointment-list/
│   │   │   │   ├── appointment-form/
│   │   │   │   └── appointments.module.ts
│   │   │   ├── doctors/
│   │   │   │   ├── doctor-list/
│   │   │   │   └── doctors.module.ts
│   │   │   ├── treatments/
│   │   │   │   ├── treatment-list/
│   │   │   │   └── treatments.module.ts
│   │   │   └── billing/
│   │   │       ├── invoice-list/
│   │   │       └── billing.module.ts
│   │   │
│   │   ├── layouts/
│   │   │   └── main-layout/
│   │   │       ├── main-layout.component.ts
│   │   │       └── main-layout.module.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   │
│   ├── assets/
│   ├── styles/
│   │   └── styles.css
│   ├── index.html
│   ├── main.ts
│   └── angular.json
│
├── package.json
├── tsconfig.json
└── README.md
```

## Solution Structure

```
DentalClinic.sln
├── DentalClinic.Domain.csproj
├── DentalClinic.Application.csproj
├── DentalClinic.Infrastructure.csproj
└── DentalClinic.Api.csproj
```
