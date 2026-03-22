# Implementation Tasks

## Phase 1: Project Setup

### Backend Setup
- [ ] Create .NET solution and projects
  - [ ] DentalClinic.Domain
  - [ ] DentalClinic.Application
  - [ ] DentalClinic.Infrastructure
  - [ ] DentalClinic.Api
- [ ] Add NuGet packages
  - [ ] Entity Framework Core
  - [ ] FluentValidation
  - [ ] Serilog
- [ ] Configure Program.cs
- [ ] Setup appsettings.json

### Frontend Setup
- [ ] Create Angular project
- [ ] Install Bootstrap 5
- [ ] Setup main layout
- [ ] Configure routing

---

## Phase 2: Domain Layer

### Entities
- [ ] Patient.cs
- [ ] Doctor.cs
- [ ] Appointment.cs
- [ ] Treatment.cs
- [ ] Invoice.cs
- [ ] InvoiceItem.cs

### Enums
- [ ] Gender
- [ ] AppointmentStatus
- [ ] InvoiceStatus

### Interfaces
- [ ] IPatientRepository
- [ ] IDoctorRepository
- [ ] IAppointmentRepository
- [ ] ITreatmentRepository
- [ ] IInvoiceRepository

---

## Phase 3: Application Layer

### DTOs
- [ ] PatientDto
- [ ] CreatePatientDto
- [ ] UpdatePatientDto
- [ ] DoctorDto
- [ ] AppointmentDto
- [ ] CreateAppointmentDto
- [ ] TreatmentDto
- [ ] InvoiceDto
- [ ] CreateInvoiceDto
- [ ] DashboardStatsDto

### Interfaces (Services)
- [ ] IPatientService
- [ ] IDoctorService
- [ ] IAppointmentService
- [ ] ITreatmentService
- [ ] IInvoiceService
- [ ] IDashboardService

### Services (Implementations)
- [ ] PatientService
- [ ] DoctorService
- [ ] AppointmentService
- [ ] TreatmentService
- [ ] InvoiceService
- [ ] DashboardService

---

## Phase 4: Infrastructure Layer

### Data
- [ ] DentalClinicDbContext.cs
- [ ] SeedData.cs (Doctors, Treatments)

### Repositories
- [ ] PatientRepository
- [ ] DoctorRepository
- [ ] AppointmentRepository
- [ ] TreatmentRepository
- [ ] InvoiceRepository

### Migrations
- [ ] InitialCreate migration
- [ ] Apply migration to database

---

## Phase 5: API Controllers

### Controllers
- [ ] PatientsController
  - [ ] GET /patients
  - [ ] GET /patients/{id}
  - [ ] POST /patients
  - [ ] PUT /patients/{id}
  - [ ] DELETE /patients/{id}
- [ ] DoctorsController
  - [ ] GET /doctors
  - [ ] GET /doctors/{id}
  - [ ] GET /doctors/{id}/schedule
- [ ] AppointmentsController
  - [ ] GET /appointments
  - [ ] GET /appointments/{id}
  - [ ] GET /appointments/available-slots
  - [ ] POST /appointments
  - [ ] PUT /appointments/{id}
  - [ ] DELETE /appointments/{id}
- [ ] TreatmentsController
  - [ ] GET /treatments
  - [ ] POST /treatments
  - [ ] PUT /treatments/{id}
  - [ ] DELETE /treatments/{id}
- [ ] InvoicesController
  - [ ] GET /invoices
  - [ ] GET /invoices/{id}
  - [ ] POST /invoices
  - [ ] PATCH /invoices/{id}/pay
- [ ] DashboardController
  - [ ] GET /dashboard/stats
  - [ ] GET /dashboard/today-schedule

### Middleware
- [ ] ExceptionMiddleware

---

## Phase 6: Frontend - Core

### Models
- [ ] patient.model.ts
- [ ] doctor.model.ts
- [ ] appointment.model.ts
- [ ] treatment.model.ts
- [ ] invoice.model.ts

### Services
- [ ] patient.service.ts
- [ ] doctor.service.ts
- [ ] appointment.service.ts
- [ ] treatment.service.ts
- [ ] invoice.service.ts
- [ ] dashboard.service.ts

### Shared Components
- [ ] sidebar.component.ts
- [ ] header.component.ts
- [ ] confirm-dialog.component.ts

### Layout
- [ ] main-layout.component.ts

---

## Phase 7: Frontend - Features

### Dashboard
- [ ] dashboard.component.ts (stats, today's appointments)

### Patients
- [ ] patient-list.component.ts
- [ ] patient-form.component.ts
- [ ] patient-details.component.ts

### Appointments
- [ ] appointment-list.component.ts
- [ ] appointment-form.component.ts

### Doctors
- [ ] doctor-list.component.ts

### Treatments
- [ ] treatment-list.component.ts

### Billing
- [ ] invoice-list.component.ts
- [ ] invoice-details.component.ts

---

## Phase 8: Testing & Polish

- [ ] Test all API endpoints
- [ ] Test all UI flows
- [ ] Add form validation
- [ ] Add loading states
- [ ] Handle error states
- [ ] Verify seed data

---

## Priority Order

1. Domain Entities & Enums
2. Database Context & Migrations
3. Basic CRUD APIs
4. Frontend services
5. Patient list/forms
6. Appointment management
7. Dashboard
8. Billing (optional for MVP)
