import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { PortalLayoutComponent } from './layouts/portal-layout/portal-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PatientsComponent } from './features/patients/patients.component';
import { PatientFormComponent } from './features/patients/patient-form.component';
import { AppointmentsComponent } from './features/appointments/appointments.component';
import { AppointmentFormComponent } from './features/appointments/appointment-form.component';
import { DoctorsComponent } from './features/doctors/doctors.component';
import { TreatmentsComponent } from './features/treatments/treatments.component';
import { BillingComponent } from './features/billing/billing.component';
import { CouponsComponent } from './features/coupons/coupons.component';
import { TreatmentRecordsComponent } from './features/treatment-records/treatment-records.component';
import { portalAuthGuard } from './core/guards/portal-auth.guard';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

export const routes: Routes = [
  // Admin login page (no guard, no layout)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/admin-login.component').then(m => m.AdminLoginComponent)
  },
  // Admin panel (guarded)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [adminAuthGuard],
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
      { path: 'coupons', component: CouponsComponent },
      { path: 'treatment-records', component: TreatmentRecordsComponent }
    ]
  },
  // Patient portal auth pages (no guard, no portal layout)
  {
    path: 'portal/login',
    loadComponent: () => import('./features/portal/auth/portal-login.component').then(m => m.PortalLoginComponent)
  },
  {
    path: 'portal/register',
    loadComponent: () => import('./features/portal/auth/portal-register.component').then(m => m.PortalRegisterComponent)
  },
  // Patient portal pages (guarded, wrapped in PortalLayoutComponent)
  {
    path: 'portal',
    component: PortalLayoutComponent,
    canActivate: [portalAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/portal/dashboard/portal-dashboard.component').then(m => m.PortalDashboardComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/portal/appointments/portal-appointments.component').then(m => m.PortalAppointmentsComponent)
      },
      {
        path: 'appointments/book',
        loadComponent: () => import('./features/portal/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./features/portal/invoices/portal-invoices.component').then(m => m.PortalInvoicesComponent)
      },
      {
        path: 'treatment-history',
        loadComponent: () => import('./features/portal/treatment-history/portal-treatment-history.component').then(m => m.PortalTreatmentHistoryComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/portal/profile/portal-profile.component').then(m => m.PortalProfileComponent)
      }
    ]
  }
];
