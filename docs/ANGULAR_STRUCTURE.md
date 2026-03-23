# Angular Frontend Structure

## Architecture Overview

The frontend uses **Angular 19** with **standalone components** (no NgModules). All components use inline templates and component-scoped styles.

```
src/app/
├── core/           # Singleton services and models
│   ├── services/   # ApiService, TranslationService
│   └── models/     # TypeScript interfaces
├── shared/         # Reusable pipes
│   └── pipes/      # TranslatePipe
├── features/       # Feature components
│   ├── dashboard/
│   ├── patients/
│   ├── appointments/
│   ├── doctors/
│   ├── treatments/
│   ├── billing/
│   └── treatment-records/
├── layouts/        # Main layout with sidebar
│   └── main-layout/
├── app.routes.ts   # Route definitions
├── app.config.ts   # App configuration
└── app.component.ts
```

---

## Core

### Services

| Service | Responsibility |
|---------|----------------|
| `ApiService` | Unified HTTP client for all backend API calls |
| `TranslationService` | Bilingual (EN/AR) translation with RTL support |

> **Note**: There is a single `ApiService` (not separate services per entity). It handles all HTTP requests to the backend.

### Models

| Model | File |
|-------|------|
| `Patient`, `CreatePatientDto`, `UpdatePatientDto` | `patient.model.ts` |
| `Doctor` | `doctor.model.ts` |
| `Appointment`, `CreateAppointmentDto`, `UpdateAppointmentDto`, `AvailableSlot` | `appointment.model.ts` |
| `Treatment`, `CreateTreatmentDto` | `treatment.model.ts` |
| `Invoice`, `InvoiceItem`, `CreateInvoiceDto`, `PayInvoiceDto`, `InvoiceStatus` | `invoice.model.ts` |
| `TreatmentRecord`, `CreateTreatmentRecordDto`, `UpdateTreatmentRecordDto` | `treatment-record.model.ts` |

### ApiService Interfaces

```typescript
interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  cancelledToday: number;
}

interface TodaySchedule {
  date: string;
  appointments: Appointment[];
}
```

---

## Shared

### Pipes

| Pipe | Purpose |
|------|---------|
| `TranslatePipe` | Translates keys using `TranslationService` |

Usage: `{{ 'patients.title' | translate }}`

---

## Translation System

The `TranslationService` provides full bilingual support:

- **Languages**: English (EN) and Arabic (AR)
- **RTL Support**: Automatically toggles `dir="rtl"` and `lang` attribute on `<html>`
- **Persistence**: Language preference stored in `localStorage`
- **Method**: `instant(key)` for programmatic translation, `TranslatePipe` for templates

Translation keys are organized by feature:
- `common.*` - Shared labels (save, cancel, loading, etc.)
- `patients.*` - Patient management
- `appointments.*` - Appointment scheduling
- `doctors.*` - Doctor profiles
- `treatments.*` - Treatment catalog
- `billing.*` - Invoice management
- `treatmentRecords.*` - Clinical treatment records
- `dashboard.*` - Dashboard widgets
- `nav.*` - Sidebar navigation
- `invoiceStatus.*` - Invoice status labels

---

## Feature Components

### Dashboard (`/dashboard`)
- Welcome header with current date/time badge
- Stats cards: Today's appointments, Total patients, Monthly revenue, Pending invoices
- Today's appointment schedule list
- Quick action buttons (New Patient, New Appointment, Treatment Records)
- Empty state illustration when no appointments

### Patients (`/patients`, `/patients/new`, `/patients/:id`)
- **PatientsComponent**: Paginated table with debounced search, avatar initials, action buttons
- **PatientFormComponent**: Add/Edit form with back navigation, form sections

### Appointments (`/appointments`, `/appointments/new`)
- **AppointmentsComponent**: Filtered table with status badges, date/doctor/status filters
- **AppointmentFormComponent**: Multi-step form with patient/doctor/treatment selection, available time slot picker (pill-shaped buttons)

### Doctors (`/doctors`)
- **DoctorsComponent**: CSS Grid card layout with avatars, specialization, contact details, availability status dot with glow ring

### Treatments (`/treatments`)
- **TreatmentsComponent**: Card grid with gradient icons, price/duration metadata, hover lift effect, inline add/edit modal

### Billing (`/invoices`)
- **BillingComponent**: Invoice table with status filter, monospace invoice numbers, tabular amounts, detail modal with item breakdown and total highlight

### Treatment Records (`/treatment-records`)
- **TreatmentRecordsComponent**: Professional clinical dental form with 11 sections:
  1. Patient & Doctor selection with visit date
  2. Chief Complaint with pain level slider (0-10 color-coded NRS)
  3. Clinical Examination (extraoral, intraoral, teeth, gum, radiographic findings)
  4. Tooth Charting - Universal Numbering System (1-32) grouped by quadrant, surface checkboxes (M/D/O/B/L/I/F)
  5. Diagnosis - ICD-10 coded dropdown with optgroups (Caries, Pulp, Periodontal, etc.)
  6. Procedure - CDT coded dropdown with optgroups (Diagnostic, Preventive, Restorative, etc.)
  7. Anaesthesia - Type dropdown (Topical/Local/Sedation), injection technique, carpules count
  8. Materials - Categorized dropdown (Restorative, Crown, Endodontic, Bone, Implant, etc.)
  9. Prescriptions - Quick-add buttons for common medications (Amoxicillin, Ibuprofen, etc.)
  10. Post-Treatment Instructions - Quick-add buttons (Post-Extraction, Post-RCT, etc.)
  11. Follow-up - Next appointment date, recall interval dropdown, additional notes
  - Patient history sidebar showing previous records

---

## Routing

### Routes (`app.routes.ts`)
```typescript
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'patients', component: PatientsComponent },
      { path: 'patients/new', component: PatientFormComponent },
      { path: 'patients/:id', component: PatientFormComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'appointments/new', component: AppointmentFormComponent },
      { path: 'doctors', component: DoctorsComponent },
      { path: 'treatments', component: TreatmentsComponent },
      { path: 'invoices', component: BillingComponent },
      { path: 'treatment-records', component: TreatmentRecordsComponent }
    ]
  }
];
```

> **Note**: All routes are eagerly loaded (no lazy loading). All components are standalone.

---

## Layout

### MainLayoutComponent
- **Sidebar**: Collapsible with custom tooth SVG logo, grouped nav sections (MAIN / MANAGEMENT), unique SVG icon per item, version footer
- **Header**: Sidebar toggle button, breadcrumb area, language switcher (EN/AR)
- **Content Area**: Router outlet with padding

```
┌────────────────────────────────────────────────────┐
│ Header (toggle, breadcrumb, lang switcher)         │
├──────────┬─────────────────────────────────────────┤
│          │                                         │
│ Sidebar  │          <router-outlet>                │
│ (Nav)    │                                         │
│          │                                         │
│ Footer   │                                         │
└──────────┴─────────────────────────────────────────┘
```

---

## Design System

### CSS Custom Properties
- **Font**: Inter (Google Fonts)
- **Primary Color**: Indigo `#4f46e5` with light/50/200 variants
- **Border Radius**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`
- **Shadows**: `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- **Gray Scale**: `--gray-50` through `--gray-900`

### Component Patterns
- **Cards**: White background, subtle border, rounded corners, shadow on hover
- **Tables**: Inside cards with zero-padding card body, sticky headers
- **Buttons**: Primary (filled indigo), outline variants, pill-shaped slots
- **Badges**: Color-coded status indicators (success/warning/danger)
- **Avatars**: Gradient circle with initials
- **Empty States**: Centered SVG illustration with muted text
- **Modals**: Backdrop blur overlay, primary-colored headers

---

## RxJS Patterns

### Subscription Cleanup
All components use `takeUntil` pattern:
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.api.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Debounced Search
```typescript
private searchSubject = new Subject<string>();

ngOnInit() {
  this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  ).subscribe(() => this.loadData());
}
```

---

## Build Configuration

### Development
```bash
npm start
# Runs at http://localhost:4200 with hot reload
```

### Production
```bash
npm run build
# Output to dist/dental-clinic-frontend/browser
```

### Key Dependencies
- Angular 19.2
- Bootstrap 5.3
- CoreUI Angular 5.4
- RxJS 7.8
- TypeScript 5.7
