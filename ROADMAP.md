# Dental Clinic Management System — Roadmap

A full-stack dental clinic management system with an admin panel and patient-facing portal.

**Tech Stack**: ASP.NET Core 9 (Clean Architecture) + Angular 19 (Standalone Components) + SQL Server + EF Core 9

---

## Architecture

```
src/
  DentalClinic.Domain/         # Entities, Enums, Interfaces
  DentalClinic.Application/    # DTOs, Service Interfaces
  DentalClinic.Infrastructure/ # EF DbContext, Repositories, Services, Migrations
  DentalClinic.Api/            # Controllers, Middleware, Program.cs

dental-clinic-frontend/        # Angular 19 SPA
  app/features/                # Admin + Portal feature components
  app/core/                    # Services, Guards, Interceptors, Models
  app/layouts/                 # MainLayout (admin), PortalLayout (patient)
```

**Entities**: Patient, Doctor, Appointment, Treatment, Invoice, InvoiceItem, TreatmentRecord
**Enums**: AppointmentStatus (6), InvoiceStatus (4), Gender (2)
**Controllers**: 9 (Patients, Doctors, Appointments, Treatments, Invoices, TreatmentRecords, Dashboard, PatientAuth, PatientPortal)

---

## Completed Features

### Admin Panel
- [x] Admin dashboard with KPIs (today's appointments, total patients, monthly revenue, pending invoices, cancelled today)
- [x] Today's schedule view and recent patients list
- [x] Patient CRUD with search and pagination
- [x] Doctor management (CRUD + schedule endpoint)
- [x] Appointment management (CRUD + status tracking + available slots)
- [x] Treatment catalog management (CRUD with pricing and duration)
- [x] Invoice management (create, pay, cancel + line items)
- [x] Treatment records (comprehensive medical documentation)
- [x] Translation/i18n support (English + Arabic)
- [x] Dark sidebar layout with collapsible navigation
- [x] Premium design system with CSS variables, gradient buttons, consistent typography

### Patient Portal
- [x] Patient self-registration with email + password (BCrypt hashing)
- [x] Patient login with JWT authentication (8-hour tokens)
- [x] Role-based authorization ("PatientOnly" policy)
- [x] Portal dashboard (upcoming appointments, pending invoices)
- [x] View and cancel appointments
- [x] 3-step appointment booking (doctor -> treatment -> date/slot)
- [x] View invoices with status badges
- [x] Treatment history with expandable records
- [x] Profile viewing and editing
- [x] Dark sidebar layout matching admin panel design
- [x] Auth guard, interceptor (Bearer token on `/api/portal/*` only)

### Infrastructure
- [x] Clean Architecture (Domain -> Application -> Infrastructure -> API)
- [x] Repository pattern with EF Core
- [x] JWT authentication with refresh token fields
- [x] Centralized exception handling middleware
- [x] Swagger/OpenAPI documentation
- [x] CORS configured for Angular dev server
- [x] Auto-migration on startup (`Database.Migrate()`)
- [x] Seed data (4 doctors, 8 treatments)
- [x] Strategic database indexes (Phone, Email, AppointmentDate, InvoiceNumber)

---

## Future Work

### Phase 1 — Security & Authentication
> Priority: **Critical** — Required before production deployment

- [x] Add admin authentication (login endpoint, admin JWT policy)
- [x] Add role-based access control (Admin, Doctor, Receptionist roles)
- [x] Implement email verification on patient registration
- [x] Add password reset flow (forgot password -> email link -> reset)
- [x] Implement refresh token rotation (endpoint to refresh expired JWT)
- [x] Secure admin API endpoints with `[Authorize(Policy = "AdminOnly")]`
- [x] Add account lockout after failed login attempts
- [x] Add password strength validation rules

### Phase 2 — Notifications & Communication
> Priority: **High** — Major UX improvement

- [x] Set up email service (SMTP or SendGrid/Mailgun integration)
- [x] Send appointment confirmation email on booking
- [ ] Send appointment reminder email (24 hours before)
- [x] Send invoice email when created
- [x] Send payment confirmation email
- [x] Add in-app notification system (bell icon with unread count)
- [x] Add notification preferences per patient (email on/off, SMS on/off)
- [ ] SMS notification support for appointment reminders (Twilio/Vonage)

### Phase 3 — Advanced Scheduling
> Priority: **High** — Core business feature

- [x] Add doctor working hours configuration (per day of week)
- [x] Add doctor day-off / leave management (CRUD for unavailable dates)
- [x] Add minimum advance booking time validation (e.g., 24 hours)
- [x] Add maximum future booking limit (e.g., 90 days)
- [x] Add buffer time between appointments (configurable per doctor)
- [x] Add appointment conflict detection and prevention
- [x] Add appointment rescheduling (change date/time without cancel + rebook)
- [ ] Add recurring appointment support (e.g., monthly checkups)
- [x] Add waiting list for fully-booked time slots
- [x] Validate treatment duration fits within selected time slot

### Phase 4 — Payments & Billing
> Priority: **Medium** — Revenue feature

- [x] Add online payment from patient portal
- [x] Add payment transaction logging (transaction ID, gateway response)
- [x] Add partial payment support
- [x] Add refund processing
- [x] Add discount / coupon system
- [x] Add late payment tracking (due dates, overdue status)
- [ ] Integrate payment gateway (Stripe or PayPal)
- [ ] Add payment plan / installment support
- [ ] Add invoice PDF generation and download
- [ ] Add invoice templates (customizable clinic branding)

### Phase 5 — Reporting & Analytics
> Priority: **Medium** — Business intelligence

- [ ] Revenue reports (by date range, doctor, treatment type)
- [ ] Patient statistics (demographics, new vs returning, gender distribution)
- [ ] Appointment analytics (completion rate, no-show rate, cancellation trends)
- [ ] Doctor performance metrics (appointments completed, revenue generated)
- [ ] Treatment popularity analysis
- [ ] Monthly/quarterly summary reports
- [ ] Export reports to CSV
- [ ] Export reports to PDF
- [ ] Admin dashboard charts (line chart for revenue trend, bar chart for appointments)

### Phase 6 — Document Management
> Priority: **Medium** — Clinical workflow

- [ ] File upload infrastructure (Azure Blob Storage or local storage)
- [ ] X-ray image upload linked to treatment records
- [ ] Prescription document upload/generation
- [ ] Before/after treatment photos
- [ ] Document viewer in patient portal (patients can view their own files)
- [ ] File type validation and size limits
- [ ] Document versioning and archival

### Phase 7 — Patient Experience Enhancements
> Priority: **Low** — Nice-to-have improvements

- [ ] Structured medical history (allergies, medications, conditions as separate fields/tables)
- [ ] Family medical history tracking
- [ ] Patient satisfaction surveys (post-appointment feedback)
- [ ] Patient follow-up tracking and reminders
- [ ] Treatment plan viewer in portal (see upcoming treatment stages)
- [ ] Appointment history with doctor notes (patient-visible portion)
- [ ] Portal: change password functionality
- [ ] Portal: dark mode toggle
- [ ] Portal: mobile-responsive improvements

### Phase 8 — Infrastructure & Code Quality
> Priority: **Low** — Technical debt and production readiness

- [ ] Add structured logging (Serilog or NLog)
- [ ] Add audit trail for sensitive operations (who changed what, when)
- [ ] Add API versioning (`/api/v1/...`)
- [ ] Add rate limiting on authentication endpoints
- [ ] Add request/response logging middleware
- [ ] Add unit tests for services
- [ ] Add integration tests for API endpoints
- [ ] Add frontend unit tests (Jasmine/Karma)
- [ ] Add health check endpoint (`/health`)
- [ ] Add Docker support (Dockerfile + docker-compose)
- [ ] Add CI/CD pipeline configuration (GitHub Actions)
- [ ] Add data backup and restore endpoints
- [ ] Move inline component styles to separate `.css` files

---

## Quick Reference

| Area | Admin Endpoint | Portal Endpoint |
|------|---------------|-----------------|
| Patients | `GET/POST/PUT/DELETE /api/patients` | — |
| Doctors | `GET /api/doctors` | — |
| Appointments | `GET/POST/PUT/DELETE /api/appointments` | `GET/POST/DELETE /api/portal/appointments` |
| Treatments | `GET/POST/PUT/DELETE /api/treatments` | — |
| Invoices | `GET/POST/PATCH /api/invoices` | `GET /api/portal/invoices` |
| Treatment Records | `GET/POST/PUT/DELETE /api/treatment-records` | `GET /api/portal/treatment-history` |
| Dashboard | `GET /api/dashboard/stats\|today-schedule\|recent-patients` | — |
| Auth | — | `POST /api/patient-auth/register\|login` |
| Profile | — | `GET/PUT /api/portal/profile` |

---

*Last updated: 2026-03-28*
