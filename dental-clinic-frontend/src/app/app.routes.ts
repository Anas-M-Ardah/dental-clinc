import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PatientsComponent } from './features/patients/patients.component';
import { PatientFormComponent } from './features/patients/patient-form.component';
import { AppointmentsComponent } from './features/appointments/appointments.component';
import { AppointmentFormComponent } from './features/appointments/appointment-form.component';
import { DoctorsComponent } from './features/doctors/doctors.component';
import { TreatmentsComponent } from './features/treatments/treatments.component';
import { BillingComponent } from './features/billing/billing.component';
import { TreatmentRecordsComponent } from './features/treatment-records/treatment-records.component';

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
