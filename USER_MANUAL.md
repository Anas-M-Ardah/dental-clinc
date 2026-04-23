# Dental Clinic Management System - User Manual

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Getting Started (Local Development)](#3-getting-started-local-development)
4. [Getting Started (Docker)](#4-getting-started-docker)
5. [Running the Desktop App (Electron)](#5-running-the-desktop-app-electron)
6. [Default Credentials](#6-default-credentials)
7. [Admin Panel Guide](#7-admin-panel-guide)
8. [Patient Portal Guide](#8-patient-portal-guide)
9. [API Reference](#9-api-reference)
10. [Configuration](#10-configuration)
11. [Keyboard Shortcuts (Desktop App)](#11-keyboard-shortcuts-desktop-app)
12. [Building for Production](#12-building-for-production)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| .NET SDK | 9.0+ | Backend API |
| Node.js | 20+ | Frontend + Electron |
| npm | 10+ | Package management |
| SQL Server | 2019+ | Database |
| Docker (optional) | 24+ | Containerized deployment |
| Angular CLI | 19+ | Installed via npm |

**Check your versions:**

```bash
dotnet --version      # Should show 9.x.x
node --version        # Should show v20.x.x or higher
npm --version         # Should show 10.x.x or higher
docker --version      # Optional, for Docker deployment
```

---

## 2. Project Structure

```
Dental Clinc Clean/
|
|-- src/                              # Backend (.NET)
|   |-- DentalClinic.Domain/         # Entities, Enums, Interfaces
|   |-- DentalClinic.Application/    # DTOs, Service Interfaces
|   |-- DentalClinic.Infrastructure/ # DbContext, Repositories, Services, Migrations
|   |-- DentalClinic.Api/            # Controllers, Middleware, Program.cs
|
|-- dental-clinic-frontend/           # Frontend (Angular + Electron)
|   |-- src/app/features/            # All page components (admin + portal)
|   |-- src/app/core/                # Services, Guards, Interceptors
|   |-- src/app/layouts/             # MainLayout (admin), PortalLayout (patient)
|   |-- src/app/shared/              # Shared components (offline banner, etc.)
|   |-- electron/                    # Electron main process + preload
|   |   |-- main.js                  # Electron entry point
|   |   |-- preload.js               # IPC bridge (contextBridge)
|   |   |-- assets/                  # App icons
|
|-- Dockerfile                        # API Docker image
|-- docker-compose.yml                # Full stack (API + SQL Server)
|-- .github/workflows/ci.yml         # CI/CD pipeline
```

---

## 3. Getting Started (Local Development)

### Step 1: Set up the database

Make sure SQL Server is running locally. The default connection string expects:
- **Server**: `localhost`
- **Database**: `DentalClinic` (created automatically)
- **Authentication**: Windows Authentication (Trusted Connection)

If you use SQL Server Authentication instead, update `appsettings.json` (see [Configuration](#10-configuration)).

### Step 2: Start the backend API

```bash
cd src/DentalClinic.Api
dotnet run
```

The API will:
- Automatically run all EF Core migrations (creates the database and tables)
- Seed a default admin account (see [Default Credentials](#6-default-credentials))
- Seed default working hours for all doctors (Sun-Thu, 8:00-17:00)
- Start listening on `https://localhost:5001` and `http://localhost:5000`

Verify it's running:
- Open `http://localhost:5000/swagger` to see the Swagger UI
- Open `http://localhost:5000/health` to check the health endpoint

### Step 3: Start the frontend

```bash
cd dental-clinic-frontend
npm install        # First time only
npm start          # Starts Angular dev server
```

The frontend will be available at `http://localhost:4200`.

### Step 4: Open the app

| URL | What |
|-----|------|
| `http://localhost:4200/#/login` | Admin login page |
| `http://localhost:4200/#/dashboard` | Admin dashboard (requires login) |
| `http://localhost:4200/#/portal/login` | Patient portal login |
| `http://localhost:4200/#/portal/register` | Patient registration |

---

## 4. Getting Started (Docker)

This is the easiest way to run the full stack without installing SQL Server locally.

```bash
# From the project root
docker-compose up --build
```

This starts:
- **SQL Server** on port `1433` (SA password: `DentalClinic@2024!`)
- **API** on port `7000`

The API auto-migrates the database on startup. Once both containers are healthy:

```bash
# Check health
curl http://localhost:7000/health
```

To run the frontend against the Docker API, update the API URL in the Angular services to point to `http://localhost:7000` instead of the default `http://localhost:5000`.

To stop:
```bash
docker-compose down          # Stop containers (keep data)
docker-compose down -v       # Stop and delete all data
```

---

## 5. Running the Desktop App (Electron)

### Development mode (with hot reload)

This runs Angular dev server + Electron side by side:

```bash
cd dental-clinic-frontend
npm install                   # First time only
npm run electron:serve        # Starts Angular + Electron concurrently
```

This will:
1. Start `ng serve` on `http://localhost:4200`
2. Wait for the server to be ready
3. Launch Electron pointing at `localhost:4200`

### Development mode (pre-built)

```bash
cd dental-clinic-frontend
npm run electron:dev          # Builds Angular first, then launches Electron
```

### Build installers

```bash
# Build for your current platform
npm run electron:build

# Build for a specific platform
npm run electron:build:win      # Windows (.exe)
npm run electron:build:mac      # macOS (.dmg)
npm run electron:build:linux    # Linux (.AppImage, .deb)
```

Installers are output to `dental-clinic-frontend/release/`.

### Desktop app features

- **System tray**: The app minimizes to the system tray when you close the window. Double-click the tray icon or right-click for quick actions.
- **Offline banner**: A yellow banner appears at the top when your internet connection drops.
- **Auto-updates**: When a new version is available, a blue banner prompts you to restart and update.
- **Native print**: Use `Ctrl+P` to print the current page via the OS print dialog.

---

## 6. Default Credentials

### Admin Account (seeded automatically)

| Field | Value |
|-------|-------|
| Email | `admin@clinic.com` |
| Password | `Admin@123` |

### Patient Account

No default patient is seeded. Register a new patient at `/#/portal/register`.

**Patient registration requires:**
- Full name
- Email address
- Password (must meet strength rules)

After registration, the patient can log in at `/#/portal/login`.

---

## 7. Admin Panel Guide

After logging in at `/#/login`, you'll see the admin dashboard.

### Navigation (sidebar)

| Menu Item | Route | Description |
|-----------|-------|-------------|
| Dashboard | `/dashboard` | KPIs, today's schedule, recent patients, revenue chart |
| Patients | `/patients` | List, search, add, edit, delete patients |
| Appointments | `/appointments` | Manage all appointments, status tracking |
| Doctors | `/doctors` | Doctor profiles, working hours, day-off management |
| Treatments | `/treatments` | Treatment catalog with pricing and duration |
| Billing | `/invoices` | Invoices, payments, partial payments, refunds |
| Coupons | `/coupons` | Discount coupon management |
| Reports | `/reports` | Revenue, patient, appointment, and doctor reports with CSV export |
| Documents | `/documents` | Upload and manage patient documents (X-rays, prescriptions, photos) |
| Treatment Records | `/treatment-records` | Detailed clinical records linked to appointments |

### Key workflows

**Adding a new patient:**
1. Go to Patients > click "New Patient"
2. Fill in personal details (name, phone, email, gender, date of birth)
3. Save

**Creating an appointment:**
1. Go to Appointments > click "New Appointment"
2. Select a patient, doctor, treatment, date, and available time slot
3. The system validates: doctor availability, slot conflicts, buffer time, advance booking limits
4. Save

**Creating an invoice:**
1. Go to Billing > click "New Invoice"
2. Select a patient, add line items (treatments), set due date
3. Save. The patient receives an email notification.

**Processing a payment:**
1. Open an invoice > click "Record Payment"
2. Enter amount (supports partial payments)
3. Apply a coupon code if applicable

**Viewing reports:**
1. Go to Reports
2. Select report type (Revenue, Patients, Appointments, Doctors)
3. Set date range and filters
4. View charts and data, export to CSV

**Managing documents:**
1. Go to Documents
2. Search by patient name
3. Upload files (X-rays, prescriptions, photos, lab results, consent forms, other)
4. Max file size and type validation is enforced

**Language toggle:**
- Click the globe icon in the header to switch between English and Arabic

---

## 8. Patient Portal Guide

### Registration and login

1. Go to `/#/portal/register`
2. Fill in name, email, password
3. Check your email for a verification link (if SMTP is configured)
4. Log in at `/#/portal/login`

### Portal navigation (sidebar)

| Menu Item | Route | Description |
|-----------|-------|-------------|
| Dashboard | `/portal/dashboard` | Upcoming appointments, pending invoices |
| Appointments | `/portal/appointments` | View, cancel, or book new appointments |
| Book Appointment | `/portal/appointments/book` | 3-step booking wizard |
| Invoices | `/portal/invoices` | View invoices and payment status |
| Treatment History | `/portal/treatment-history` | Past treatment records with doctor notes |
| Treatment Plan | `/portal/treatment-plan` | Upcoming treatment stages (timeline view) |
| Documents | `/portal/documents` | View your documents (X-rays, prescriptions, etc.) |
| Medical History | `/portal/medical-history` | Allergies, medications, conditions, family history |
| Surveys | `/portal/surveys` | Post-appointment satisfaction surveys |
| Profile | `/portal/profile` | View/edit profile, change password |

### Key workflows

**Booking an appointment:**
1. Go to Appointments > "Book New Appointment"
2. Step 1: Select a doctor
3. Step 2: Select a treatment
4. Step 3: Pick a date and available time slot
5. Confirm booking. You'll receive an email confirmation.

**Completing a survey:**
1. Go to Surveys
2. Pending surveys appear for completed appointments
3. Rate overall experience, staff, cleanliness, wait time (1-5 stars)
4. Add optional comments and recommendation

**Changing your password:**
1. Go to Profile
2. Scroll to the "Change Password" section
3. Enter current password, new password, and confirm

**Dark mode:**
- Click the moon/sun icon in the portal sidebar to toggle dark mode
- Your preference is saved across sessions

---

## 9. API Reference

The API runs on `http://localhost:5000` (dev) or `http://localhost:7000` (Docker).

### Swagger UI

Visit `/swagger` in development mode for full interactive API documentation.

### Authentication

All admin endpoints require a JWT token with the `admin` role in the `Authorization: Bearer <token>` header.

All portal endpoints (`/api/portal/*`) require a JWT token with the `patient` role.

**Login (Admin):**
```
POST /api/admin-auth/login
Body: { "email": "admin@clinic.com", "password": "Admin@123" }
Returns: { "token": "...", "refreshToken": "...", "expiresAt": "..." }
```

**Login (Patient):**
```
POST /api/patient-auth/login
Body: { "email": "...", "password": "..." }
Returns: { "token": "...", "refreshToken": "...", "expiresAt": "..." }
```

**Refresh token:**
```
POST /api/admin-auth/refresh    (admin)
POST /api/patient-auth/refresh  (patient)
Body: { "refreshToken": "..." }
```

### Rate limiting

Authentication endpoints are rate-limited to **10 requests per 5 minutes** per client. Exceeding this returns HTTP `429 Too Many Requests`.

### Health check

```
GET /health
Returns: "Healthy" (with DB connectivity check)
```

### Full endpoint list

| Area | Admin Endpoints | Portal Endpoints |
|------|----------------|-----------------|
| Patients | `GET/POST/PUT/DELETE /api/patients` | -- |
| Doctors | `GET /api/doctors` | -- |
| Appointments | `GET/POST/PUT/DELETE /api/appointments` | `GET/POST/DELETE /api/portal/appointments` |
| Treatments | `GET/POST/PUT/DELETE /api/treatments` | -- |
| Invoices | `GET/POST/PATCH /api/invoices` | `GET /api/portal/invoices` |
| Treatment Records | `GET/POST/PUT/DELETE /api/treatment-records` | `GET /api/portal/treatment-history` |
| Dashboard | `GET /api/dashboard/stats\|today-schedule\|recent-patients` | -- |
| Documents | `GET/POST/PATCH/DELETE /api/documents` | `GET /api/portal/documents` |
| Medical History | `GET/POST/DELETE /api/patients/{id}/medical-history/*` | `GET /api/portal/medical-history` |
| Surveys | -- | `GET/POST /api/portal/surveys` |
| Reports | `GET /api/reports/*` | -- |
| Profile | -- | `GET/PUT /api/portal/profile` |

---

## 10. Configuration

### Backend (`src/DentalClinic.Api/appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DentalClinic;Trusted_Connection=true;TrustServerCertificate=true"
  },
  "Jwt": {
    "Key": "DentalClinicPortalSuperSecretKey2024!XyZ#",
    "Issuer": "DentalClinicApi",
    "Audience": "DentalClinicPortal",
    "ExpiryHours": "8"
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "clinic@example.com",
    "SenderName": "Dental Clinic",
    "Password": "",
    "EnableSsl": true
  }
}
```

**Key settings:**

| Setting | Description |
|---------|-------------|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string. Change `Server`, add `User Id`/`Password` for SQL auth. |
| `Jwt:Key` | Secret key for JWT signing. **Change this in production!** |
| `Jwt:ExpiryHours` | Token lifetime in hours (default: 8) |
| `Email:SmtpHost` | SMTP server for sending emails |
| `Email:Password` | SMTP password. **Leave empty to disable email sending.** |

### Environment variable overrides

For Docker or production, override settings via environment variables using `__` as separator:

```bash
ConnectionStrings__DefaultConnection="Server=myserver;..."
Jwt__Key="my-production-secret-key"
Email__Password="my-smtp-password"
```

### Frontend API URLs

The frontend API base URLs are configured in:
- `dental-clinic-frontend/src/app/core/services/api.service.ts` (admin endpoints)
- `dental-clinic-frontend/src/app/core/services/portal-api.service.ts` (portal endpoints)

Default: `http://localhost:5000/api`

### Logging

Logs are written to:
- **Console**: Structured output with timestamp
- **File**: `logs/dental-clinic-YYYY-MM-DD.log` (rolling daily, keeps last 30 days)

---

## 11. Keyboard Shortcuts (Desktop App)

These shortcuts are available when running as an Electron desktop app:

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Go to Dashboard |
| `Ctrl+Shift+A` | Go to Appointments |
| `Ctrl+Shift+P` | Go to Patients |
| `Ctrl+P` | Print current page |

On macOS, use `Cmd` instead of `Ctrl`.

---

## 12. Building for Production

### Backend only

```bash
cd src/DentalClinic.Api
dotnet publish -c Release -o ./publish
```

The output in `./publish` contains the self-contained API ready for deployment.

### Frontend only (web)

```bash
cd dental-clinic-frontend
npx ng build --configuration production
```

Output: `dental-clinic-frontend/dist/dental-clinic-frontend/browser/`

Deploy this folder to any static file host (Nginx, Apache, Azure Static Web Apps, etc.).

### Full stack with Docker

```bash
docker-compose up --build -d
```

### Desktop installers

```bash
cd dental-clinic-frontend
npm run electron:build:win      # Windows
npm run electron:build:mac      # macOS
npm run electron:build:linux    # Linux
```

Output: `dental-clinic-frontend/release/`

---

## 13. Troubleshooting

### "Cannot connect to SQL Server"

- Ensure SQL Server is running and accepting TCP connections on port 1433
- Check the connection string in `appsettings.json`
- For Docker: wait for the SQL Server health check to pass (can take 30 seconds)

### "CORS error in browser console"

- The API allows CORS from `http://localhost:4200` only
- If running the frontend on a different port, update the CORS policy in `Program.cs`

### "JWT token expired"

- Tokens expire after 8 hours by default
- Use the refresh token endpoint to get a new token
- The frontend interceptors handle this automatically

### "Emails not being sent"

- Check the `Email` section in `appsettings.json`
- If `Password` is empty, email sending is disabled (operations succeed silently)
- For Gmail: use an App Password, not your account password

### "Electron app shows blank screen"

- **Dev mode**: Make sure `ng serve` is running on `http://localhost:4200` first
- **Production build**: Make sure you ran `ng build` before `electron .`
- Check the Electron console for errors (`View > Toggle Developer Tools`)

### "Database migration errors"

- The API auto-migrates on startup. If it fails:
  ```bash
  cd src/DentalClinic.Api
  dotnet ef database update --project ../DentalClinic.Infrastructure
  ```

### Port conflicts

| Service | Default Port | How to change |
|---------|-------------|---------------|
| API (dev) | 5000/5001 | `launchSettings.json` |
| API (Docker) | 7000 | `docker-compose.yml` + `Dockerfile` |
| Frontend | 4200 | `ng serve --port 4300` |
| SQL Server | 1433 | `docker-compose.yml` |
| Electron | -- | Uses API port above |
