# Dental Clinic Management System

A full-stack dental clinic management application built with ASP.NET Core (Clean Architecture) and Angular.

## Features

- **Patient Management** - Register, view, edit, and delete patients with search and pagination
- **Appointment Scheduling** - Create appointments with available time slot selection, filter by doctor/date/status
- **Doctor Management** - View doctors, specializations, and availability
- **Treatment Catalog** - View dental treatments and pricing
- **Treatment Records** - Comprehensive clinical records with diagnosis, procedures, prescriptions, and follow-up
- **Billing** - Create invoices, view details, and track payment status
- **Dashboard** - Overview statistics (today's appointments, patients, revenue, pending invoices) and today's schedule
- **Bilingual Support** - English and Arabic with RTL layout support

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | ASP.NET Core 9 (Clean Architecture) |
| Frontend | Angular 19 (Standalone Components) |
| Database | SQL Server |
| ORM | Entity Framework Core 9 |
| API Docs | Swagger / OpenAPI |
| UI | Custom CSS with Bootstrap 5 base |

## Project Structure

```
DentalClinic/
├── src/
│   ├── DentalClinic.Domain/          # Entities, Enums, Repository Interfaces
│   ├── DentalClinic.Application/     # Services, DTOs, Service Interfaces
│   ├── DentalClinic.Infrastructure/  # EF Core DbContext, Repositories, Seed Data
│   └── DentalClinic.Api/            # REST Controllers, Middleware, Program.cs
│
├── dental-clinic-frontend/
│   └── src/app/
│       ├── core/                    # Services (API, Translation), Models
│       ├── features/               # Feature Components (Dashboard, Patients, etc.)
│       ├── layouts/                # Main Layout with Sidebar
│       └── shared/                 # Shared Pipes (Translate)
│
└── docs/                           # Documentation
```

## Quick Start

### Prerequisites
- .NET 9 SDK
- Node.js 18+
- SQL Server 2019+

### Backend Setup

```bash
# Restore packages
dotnet restore

# Run backend (database is auto-created with seed data)
cd src/DentalClinic.Api
dotnet run
```

API runs at: `http://localhost:7000`
Swagger: `http://localhost:7000/swagger` (Development mode)

### Frontend Setup

```bash
cd dental-clinic-frontend

# Install dependencies
npm install

# Run frontend
npm start
```

Frontend runs at: `http://localhost:4200`

## Architecture

### Backend - Clean Architecture

The backend follows **Clean Architecture** with four layers:

1. **Domain** - Core entities (`Patient`, `Doctor`, `Appointment`, `Treatment`, `Invoice`, `TreatmentRecord`), enums, and repository interfaces. No external dependencies.

2. **Application** - Business logic services, DTOs with validation attributes, and service interfaces. Depends only on Domain.

3. **Infrastructure** - EF Core implementation of repositories, database context, and seed data. Depends on Domain and Application.

4. **API** - ASP.NET Core controllers, global exception handling middleware, Swagger configuration. Depends on all layers for DI wiring.

### Frontend - Angular 19

- **Standalone Components** - No NgModules, all components are standalone
- **Feature-based Organization** - Each feature (patients, appointments, etc.) in its own folder
- **Translation Service** - Built-in bilingual support (EN/AR) with RTL layout
- **Reactive Patterns** - RxJS with proper `takeUntil` cleanup to prevent memory leaks

## Seed Data

The application seeds the following data on first run:

### Doctors
- Dr. Ahmad Al-Masri (General Dentistry)
- Dr. Sara Ahmad (Orthodontics)
- Dr. Omar Khaleel (Oral Surgery)
- Dr. Layla Hassan (Pediatric Dentistry)

### Treatments
| Treatment | Price | Duration |
|-----------|-------|----------|
| Teeth Cleaning | $50 | 30 min |
| Teeth Whitening | $150 | 60 min |
| Dental Filling | $80 | 45 min |
| Root Canal | $300 | 90 min |
| Dental Crown | $500 | 60 min |
| Braces | $2,000 | 120 min |
| Tooth Extraction | $100 | 30 min |
| Dental Implant | $1,500 | 120 min |

## API Endpoints

| Resource | Methods | Description |
|----------|---------|-------------|
| `/api/patients` | GET, POST | List (with search/pagination) and create patients |
| `/api/patients/{id}` | GET, PUT, DELETE | Get, update, or delete a patient |
| `/api/doctors` | GET | List all available doctors |
| `/api/doctors/{id}` | GET | Get doctor details |
| `/api/doctors/{id}/schedule` | GET | Get doctor's schedule for a date |
| `/api/appointments` | GET, POST | List (with filters/pagination) and create appointments |
| `/api/appointments/{id}` | GET, PUT, DELETE | Get, update, or delete an appointment |
| `/api/appointments/available-slots` | GET | Get available time slots for a doctor on a date |
| `/api/treatments` | GET, POST | List and create treatments |
| `/api/treatments/{id}` | GET, PUT, DELETE | Get, update, or soft-delete a treatment |
| `/api/treatment-records/patient/{id}` | GET | Get treatment records for a patient |
| `/api/treatment-records` | POST | Create a treatment record |
| `/api/treatment-records/{id}` | GET, PUT, DELETE | Get, update, or delete a treatment record |
| `/api/invoices` | GET, POST | List (with filters/pagination) and create invoices |
| `/api/invoices/{id}` | GET | Get invoice with items |
| `/api/invoices/{id}/pay` | PATCH | Mark invoice as paid |
| `/api/invoices/{id}/cancel` | PATCH | Cancel an invoice |
| `/api/dashboard/stats` | GET | Dashboard statistics |
| `/api/dashboard/today-schedule` | GET | Today's appointment schedule |
| `/api/dashboard/recent-patients` | GET | Recently added patients |

## Error Handling

The API uses a global exception handling middleware that maps exceptions to HTTP status codes:

| Exception | HTTP Status |
|-----------|-------------|
| `KeyNotFoundException` | 404 Not Found |
| `ArgumentException` | 400 Bad Request |
| `InvalidOperationException` | 409 Conflict |
| Other exceptions | 500 Internal Server Error |

## Documentation

See the `docs/` folder for detailed documentation:

- [Architecture](docs/ARCHITECTURE.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [API Endpoints](docs/API_ENDPOINTS.md)
- [Domain Model](docs/DOMAIN_MODEL.md)
- [Setup Guide](docs/SETUP.md)
- [Database](docs/DATABASE.md)
- [Angular Structure](docs/ANGULAR_STRUCTURE.md)
- [Naming Conventions](docs/NAMING_CONVENTIONS.md)

## License

MIT License
