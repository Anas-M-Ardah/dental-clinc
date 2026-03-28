# Unit Testing Documentation

## Overview

This project has full unit test coverage for both the **.NET backend** and the **Angular frontend**.

| Stack    | Framework        | Mocking       | Assertions       | Tests |
|----------|------------------|---------------|------------------|-------|
| Backend  | xUnit 2.9.2      | Moq 4.20.72   | FluentAssertions 7.2.0 | 141 |
| Frontend | Jasmine 5.6 + Karma 6.4 | Jasmine Spies | Jasmine matchers | 256 |
| **Total** |                 |               |                  | **397** |

---

## How to Run Tests

### Run ALL tests (backend + frontend)

```bash
# From solution root (D:\Projects\dental-clinc)

# Backend (.NET)
dotnet test

# Frontend (Angular)
cd dental-clinic-frontend
npx ng test --watch=false --browsers=ChromeHeadless
```

### Backend Tests

```bash
# Run all backend tests
dotnet test

# With detailed output (shows each test name)
dotnet test --verbosity normal

# Run a specific test class
dotnet test --filter "FullyQualifiedName~PatientServiceTests"

# Run only service tests
dotnet test --filter "FullyQualifiedName~Services"

# Run only controller tests
dotnet test --filter "FullyQualifiedName~Controllers"

# Run with code coverage
dotnet test --collect:"XPlat Code Coverage"

# For CI/CD (TRX output)
dotnet test --no-build --verbosity normal --logger "trx;LogFileName=test-results.trx"
```

### Frontend Tests

```bash
cd dental-clinic-frontend

# Run all frontend tests (headless, single run)
npx ng test --watch=false --browsers=ChromeHeadless

# Run with live reload (development mode)
npx ng test

# Run with code coverage
npx ng test --watch=false --browsers=ChromeHeadless --code-coverage

# Run a specific test file
npx ng test --watch=false --browsers=ChromeHeadless --include="**/api.service.spec.ts"
```

### Common Issues

| Issue | Solution |
|-------|----------|
| `dotnet test` not found | Install .NET 9.0 SDK |
| Build errors | Run `dotnet restore` first |
| Chrome not found (frontend) | Install Chrome or use `--browsers=ChromeHeadless` |
| `ng test` hangs | Add `--watch=false` flag |
| Frontend tests not discovered | Run `npm install` first |

---

## Backend Test Coverage

### Test Project Structure

```
tests/DentalClinic.Tests/
├── Helpers/
│   └── TestDataFactory.cs
├── Services/
│   ├── PatientServiceTests.cs
│   ├── DoctorServiceTests.cs
│   ├── AppointmentServiceTests.cs
│   ├── TreatmentServiceTests.cs
│   ├── InvoiceServiceTests.cs
│   ├── TreatmentRecordServiceTests.cs
│   └── DashboardServiceTests.cs
├── Controllers/
│   ├── PatientsControllerTests.cs
│   ├── DoctorsControllerTests.cs
│   ├── AppointmentsControllerTests.cs
│   ├── TreatmentsControllerTests.cs
│   ├── InvoicesControllerTests.cs
│   ├── TreatmentRecordsControllerTests.cs
│   └── DashboardControllerTests.cs
└── Middleware/
    └── ExceptionHandlingMiddlewareTests.cs
```

### Service Layer (7 services -- 87 tests)

| Service                  | Tests | Scenarios Covered |
|--------------------------|-------|-------------------|
| PatientService           | 15    | CRUD, pagination, search (firstName/lastName/phone), empty/whitespace search, mapping |
| DoctorService            | 7     | GetAll, GetById, GetSchedule, null handling, field mapping |
| AppointmentService       | 17    | CRUD, pagination, filters, available slots (8am-5pm/30min), end-time calculation, entity validation |
| TreatmentService         | 10    | CRUD, soft delete, active-only filtering |
| InvoiceService           | 15    | CRUD, payment flow, cancellation, total amount calculation, invoice number generation |
| TreatmentRecordService   | 10    | CRUD, field mapping, timestamp management |
| DashboardService         | 8     | Stats aggregation, schedule ordering, recent patients limit/default |

### Controller Layer (7 controllers -- 28 tests)

| Controller                  | Tests | Scenarios Covered |
|-----------------------------|-------|-------------------|
| PatientsController          | 6     | GetAll, GetById (found/not found), Create (201), Update, Delete (204) |
| DoctorsController           | 4     | GetAll, GetById (found/not found), GetSchedule (with/null date) |
| AppointmentsController      | 6     | GetAll with filters, GetById, GetAvailableSlots, Create (201), Update, Delete (204) |
| TreatmentsController        | 5     | GetAll, GetById (found/not found), Create (201), Update, Delete (204) |
| InvoicesController          | 6     | GetAll with filters, GetById, Create (201), Pay, Cancel |
| TreatmentRecordsController  | 5     | GetByPatient, GetById, Create (201), Update, Delete (204) |
| DashboardController         | 4     | GetStats, GetTodaySchedule, GetRecentPatients |

### Middleware (8 tests)

| Middleware                    | Scenarios |
|-------------------------------|-----------|
| ExceptionHandlingMiddleware   | KeyNotFoundException->404, ArgumentException->400, InvalidOperationException->409, Generic->500, JSON format, content type, camelCase, pass-through |

---

## Frontend Test Coverage

### Test File Structure

```
dental-clinic-frontend/src/app/
├── app.component.spec.ts
├── core/
│   ├── services/
│   │   ├── api.service.spec.ts
│   │   ├── portal-api.service.spec.ts
│   │   ├── portal-auth.service.spec.ts
│   │   └── translation.service.spec.ts
│   ├── guards/
│   │   └── portal-auth.guard.spec.ts
│   └── interceptors/
│       └── portal-auth.interceptor.spec.ts
├── shared/pipes/
│   └── translate.pipe.spec.ts
├── features/
│   ├── dashboard/dashboard.component.spec.ts
│   ├── patients/
│   │   ├── patients.component.spec.ts
│   │   └── patient-form.component.spec.ts
│   ├── appointments/appointments.component.spec.ts
│   ├── doctors/doctors.component.spec.ts
│   ├── treatments/treatments.component.spec.ts
│   ├── billing/billing.component.spec.ts
│   └── portal/
│       ├── auth/
│       │   ├── portal-login.component.spec.ts
│       │   └── portal-register.component.spec.ts
│       └── dashboard/portal-dashboard.component.spec.ts
└── layouts/
    ├── main-layout/main-layout.component.spec.ts
    └── portal-layout/portal-layout.component.spec.ts
```

### Services (4 services -- ~101 tests)

| Service              | Scenarios Covered |
|----------------------|-------------------|
| ApiService           | All 27 HTTP methods: correct URL, HTTP method, query params, request body, response mapping |
| PortalApiService     | All 7 portal endpoints: profile, appointments, invoices, treatment history |
| PortalAuthService    | Login/register (POST + session storage), logout (localStorage clear + navigation), isLoggedIn (token + expiration), getToken/getPatientId/getFullName |
| TranslationService   | Language switching (en/ar), RTL detection, nested key flattening, translate/instant, localStorage persistence, document direction |

### Guards & Interceptors (~20 tests)

| Module                 | Scenarios Covered |
|------------------------|-------------------|
| portalAuthGuard        | Authenticated -> returns true, unauthenticated -> UrlTree with returnUrl |
| portalAuthInterceptor  | Adds Bearer token for /api/portal URLs, skips non-portal URLs, handles null token |

### Pipe (~9 tests)

| Pipe           | Scenarios Covered |
|----------------|-------------------|
| TranslatePipe  | Delegates to translationService.instant(), handles various key formats |

### Components (13 components -- ~126 tests)

| Component              | Scenarios Covered |
|------------------------|-------------------|
| AppComponent           | Creates, renders router-outlet |
| DashboardComponent     | loadData, stats/schedule loading, error handling, getStatusClass, getStatusText, trackById |
| PatientsComponent      | loadPatients, search debounce (300ms), pagination, goToPage bounds, deletePatient with confirm, trackById |
| PatientFormComponent   | Create mode (init, submit, navigate), Edit mode (load patient, update, navigate), error handling |
| DoctorsComponent       | Init, loads doctors, error handling, trackById |
| TreatmentsComponent    | Init, loads treatments, error handling, trackById |
| BillingComponent       | loadInvoices with/without filter, getStatusClass, viewInvoice, payInvoice with confirm |
| AppointmentsComponent  | Load appointments/doctors, filters, cancel with confirm, getStatusClass/Text |
| PortalLoginComponent   | Init, login call, returnUrl navigation, error messages |
| PortalRegisterComponent| Init, register call, navigation, error messages |
| PortalDashboardComponent| Init, API calls, data population |
| MainLayoutComponent    | Init, currentLang, toggleSidebar, toggleLanguage |
| PortalLayoutComponent  | Init, patientName, toggleSidebar, logout |

---

## Testing Strategy

### Principles
1. **Isolation**: Every service/controller/component is tested in isolation with mocked dependencies
2. **Deterministic**: No database, network, or file system calls -- all tests are fast and repeatable
3. **Arrange / Act / Assert**: Every test follows the AAA pattern
4. **Meaningful Names**: `MethodName_Scenario_ExpectedBehavior` (backend), descriptive `it('should ...')` (frontend)
5. **Edge Cases**: Null returns, not-found scenarios, empty collections, boundary values, error handling

### What is NOT unit tested (by design)
- **Repositories**: Thin EF Core wrappers -- better covered by integration tests
- **Database/EF Core**: Configuration tested via integration/E2E tests
- **Portal Backend API**: No backend portal controller exists yet
- **E2E flows**: Use Cypress/Playwright for full user journey testing

---

## Mandatory Rules

> **Tests MUST be executed after every new feature, bug fix, or code change.**

```bash
# Run before every pull request
dotnet test
cd dental-clinic-frontend && npx ng test --watch=false --browsers=ChromeHeadless
```

> **This document MUST be kept up to date.**
> When adding new services, controllers, components, or modifying existing logic, update the corresponding test files AND this document.

### When to add tests
- New service methods or business logic (backend or frontend)
- New controller endpoints or Angular components
- New middleware, guards, interceptors, or pipes
- Bug fixes (always add a regression test)
- Changes to DTO mapping, validation, or calculated fields

### Adding a new test file
1. Create the spec file next to the source file (frontend) or in the appropriate test folder (backend)
2. Follow naming conventions: `*.spec.ts` (frontend), `*Tests.cs` (backend)
3. Use shared test data: `TestDataFactory` (backend), `jasmine.createSpyObj` (frontend)
4. Verify all tests pass before committing
5. Update this document with the new test counts
