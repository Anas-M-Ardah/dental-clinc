# Dental Clinic Management System

A full-stack dental clinic management application built with ASP.NET Core (Clean Architecture) and Angular.

## Features

- **Patient Management** - Register, view, edit, and delete patients
- **Appointment Scheduling** - Create, reschedule, and cancel appointments
- **Doctor Management** - View doctors and their schedules
- **Treatment Catalog** - Manage dental treatments and pricing
- **Billing** - Create invoices and track payments
- **Dashboard** - Overview statistics and today's schedule

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | ASP.NET Core 8 |
| Frontend | Angular 17+ |
| Database | SQL Server |
| ORM | Entity Framework Core |
| UI Framework | Bootstrap 5 |

## Project Structure

```
DentalClinic/
├── docs/                    # Documentation
├── src/
│   ├── DentalClinic.Domain/        # Entities, Enums
│   ├── DentalClinic.Application/   # Services, DTOs
│   ├── DentalClinic.Infrastructure/# Repositories, Data
│   └── DentalClinic.Api/           # REST API
│
dental-clinic-frontend/
├── src/app/
│   ├── core/              # Services, Models
│   ├── features/         # Components
│   └── shared/           # Shared components
```

## Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server 2019+

### Backend Setup

```bash
# Restore packages
dotnet restore

# Create database migrations
cd src/DentalClinic.Api
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run backend
dotnet run
```

API runs at: `https://localhost:7000`
Swagger: `https://localhost:7000/swagger`

### Frontend Setup

```bash
cd dental-clinic-frontend

# Install dependencies
npm install

# Run frontend
npm start
```

Frontend runs at: `http://localhost:4200`

## Seed Data

The application seeds the following data on first run:

### Doctors
- Dr. Ahmad Al-Masri (General Dentistry)
- Dr. Sara Ahmad (Orthodontics)
- Dr. Omar Khaleel (Oral Surgery)
- Dr. Layla Hassan (Pediatric Dentistry)

### Treatments
- Teeth Cleaning - $50
- Teeth Whitening - $150
- Dental Filling - $80
- Root Canal - $300
- Dental Crown - $500
- Braces - $2000
- Tooth Extraction - $100
- Dental Implant - $1500

## API Endpoints

| Resource | Methods |
|----------|---------|
| `/api/patients` | GET, POST |
| `/api/patients/{id}` | GET, PUT, DELETE |
| `/api/doctors` | GET |
| `/api/doctors/{id}/schedule` | GET |
| `/api/appointments` | GET, POST |
| `/api/appointments/{id}` | GET, PUT, DELETE |
| `/api/treatments` | GET, POST, PUT |
| `/api/invoices` | GET, POST |
| `/api/invoices/{id}/pay` | PATCH |
| `/api/dashboard/stats` | GET |

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
