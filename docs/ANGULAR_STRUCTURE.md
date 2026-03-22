# Angular Structure

## Architecture Overview

The frontend follows a **modular architecture** with standalone components (Angular 17+).

```
src/app/
├── core/           # Singleton services, guards, interceptors
├── shared/         # Reusable components, pipes, directives
├── features/       # Feature modules (lazy loaded)
├── layouts/        # Layout components
└── app.routes.ts   # Main routing
```

---

## Core Module

### Services
All services are provided at root level (singleton).

| Service | Responsibility |
|---------|----------------|
| `PatientService` | CRUD operations for patients |
| `DoctorService` | CRUD operations for doctors |
| `AppointmentService` | Manage appointments |
| `TreatmentService` | Manage treatments |
| `InvoiceService` | Handle billing |
| `DashboardService` | Fetch dashboard stats |

### Models
```typescript
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  medicalHistory?: string;
  createdAt: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  phone: string;
  email?: string;
  bio?: string;
  isAvailable: boolean;
}

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  treatmentId: number;
  treatmentName: string;
  notes?: string;
  status: AppointmentStatus;
}

interface Treatment {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  patientId: number;
  patientName: string;
  totalAmount: number;
  status: InvoiceStatus;
  createdAt: string;
  items: InvoiceItem[];
}
```

---

## Shared Module

### Components
| Component | Purpose |
|-----------|---------|
| `SidebarComponent` | Navigation menu |
| `HeaderComponent` | Top bar with user info |
| `ConfirmDialogComponent` | Reusable confirmation modal |
| `LoadingSpinnerComponent` | Loading indicator |
| `StatusBadgeComponent` | Status pill component |

### Pipes
| Pipe | Purpose |
|------|---------|
| `StatusBadgePipe` | Convert status enum to styled badge |
| `DateFormatPipe` | Format dates consistently |
| `CurrencyFormatPipe` | Format currency |

---

## Feature Modules

### Dashboard (`/dashboard`)
- Stats cards (today appointments, patients, revenue)
- Today's appointment list
- Quick action buttons
- Recent patients list

### Patients (`/patients`)
- **PatientListComponent**: Table with search, filter, pagination
- **PatientFormComponent**: Add/Edit patient form
- **PatientDetailsComponent**: View patient profile and history

### Appointments (`/appointments`)
- **AppointmentListComponent**: Table view with filters
- **AppointmentFormComponent**: Create/reschedule appointment
- **CalendarViewComponent** (optional): Calendar visualization
- **SlotPickerComponent**: Available time slot selector

### Doctors (`/doctors`)
- **DoctorListComponent**: List all doctors
- **DoctorDetailsComponent**: Doctor profile and schedule

### Treatments (`/treatments`)
- **TreatmentListComponent**: List all treatments
- **TreatmentFormComponent**: Add/Edit treatment (admin)

### Billing (`/billing`)
- **InvoiceListComponent**: All invoices with filters
- **InvoiceDetailsComponent**: View invoice and items
- **PaymentFormComponent**: Record payment

---

## Routing

### Main Routes (`app.routes.ts`)
```typescript
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'patients/new', component: PatientFormComponent },
      { path: 'patients/:id', component: PatientDetailsComponent },
      { path: 'patients/:id/edit', component: PatientFormComponent },
      { path: 'appointments', component: AppointmentListComponent },
      { path: 'appointments/new', component: AppointmentFormComponent },
      { path: 'appointments/:id', component: AppointmentDetailsComponent },
      { path: 'doctors', component: DoctorListComponent },
      { path: 'doctors/:id', component: DoctorDetailsComponent },
      { path: 'treatments', component: TreatmentListComponent },
      { path: 'treatments/new', component: TreatmentFormComponent },
      { path: 'invoices', component: InvoiceListComponent },
      { path: 'invoices/:id', component: InvoiceDetailsComponent },
    ]
  }
];
```

---

## State Management

For this prototype, use **RxJS BehaviorSubject** in services.

```typescript
@Injectable({ providedIn: 'root' })
export class PatientService {
  private patients$ = new BehaviorSubject<Patient[]>([]);
  
  getPatients() {
    return this.patients$.asObservable();
  }
  
  loadPatients() {
    return this.http.get<Patient[]>('/api/patients')
      .subscribe(p => this.patients$.next(p));
  }
}
```

---

## UI Components (Bootstrap 5)

### Layout Structure
```
┌────────────────────────────────────────────────────┐
│ Header (Navbar)                                    │
├──────────┬─────────────────────────────────────────┤
│          │                                         │
│ Sidebar  │          Main Content                   │
│ (Nav)    │                                         │
│          │                                         │
│          │                                         │
└──────────┴─────────────────────────────────────────┘
```

### Common Patterns

#### Data Table
```html
<table class="table table-hover">
  <thead>
    <tr>
      <th>Name</th>
      <th>Phone</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr *ngFor="let item of items">
      <td>{{ item.name }}</td>
      <td>{{ item.phone }}</td>
      <td>
        <button class="btn btn-sm btn-primary">Edit</button>
        <button class="btn btn-sm btn-danger">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
```

#### Form
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div class="mb-3">
    <label class="form-label">Name</label>
    <input formControlName="name" class="form-control" />
  </div>
  <button type="submit" class="btn btn-primary">Save</button>
</form>
```

---

## HTTP Interceptors

### Auth Interceptor (for future)
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

---

## Build Configuration

### Development
```bash
npm start
# Runs at localhost:4200 with hot reload
```

### Production
```bash
npm run build
# Output to dist/dental-clinic-frontend/browser
```

### Angular.json Key Settings
- `outputPath`: `dist/dental-clinic-frontend/browser`
- `sourceMap`: true (dev), false (prod)
- `optimization`: true (prod only)
