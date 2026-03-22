import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, PagedResult } from '../../core/services/api.service';
import { Appointment, CreateAppointmentDto, AppointmentStatus } from '../../core/models/appointment.model';
import { Doctor } from '../../core/models/doctor.model';
import { Treatment } from '../../core/models/treatment.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>{{ 'appointments.title' | translate }}</h2>
      <a routerLink="/appointments/new" class="btn btn-primary">{{ 'appointments.newAppointment' | translate }}</a>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">{{ 'common.date' | translate }}</label>
            <input type="date" class="form-control" [(ngModel)]="filterDate" 
                   (change)="loadAppointments()">
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ 'appointments.doctor' | translate }}</label>
            <select class="form-select" [(ngModel)]="filterDoctorId" 
                    (change)="loadAppointments()">
              <option [ngValue]="null">{{ 'appointments.allDoctors' | translate }}</option>
              <option *ngFor="let d of doctors" [ngValue]="d.id">
                Dr. {{ d.firstName }} {{ d.lastName }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">{{ 'common.status' | translate }}</label>
            <select class="form-select" [(ngModel)]="filterStatus" 
                    (change)="loadAppointments()">
              <option [ngValue]="null">{{ 'common.all' | translate }}</option>
              <option [ngValue]="0">{{ 'appointments.pending' | translate }}</option>
              <option [ngValue]="1">{{ 'appointments.confirmed' | translate }}</option>
              <option [ngValue]="2">{{ 'appointments.inProgress' | translate }}</option>
              <option [ngValue]="3">{{ 'appointments.completed' | translate }}</option>
              <option [ngValue]="4">{{ 'appointments.cancelled' | translate }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointments Table -->
    <div class="card">
      <div class="card-body">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ 'common.date' | translate }}</th>
              <th>{{ 'common.time' | translate }}</th>
              <th>{{ 'appointments.patient' | translate }}</th>
              <th>{{ 'appointments.doctor' | translate }}</th>
              <th>{{ 'appointments.treatment' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let apt of appointments">
              <td>{{ apt.appointmentDate | date:'mediumDate' }}</td>
              <td>{{ apt.startTime }}</td>
              <td>{{ apt.patientName }}</td>
              <td>{{ apt.doctorName }}</td>
              <td>{{ apt.treatmentName }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(apt.status)">
                  {{ getStatusText(apt.status) }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-danger" 
                        (click)="cancelAppointment(apt.id)">{{ 'appointments.cancelled' | translate }}</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <p class="text-muted" *ngIf="!appointments.length">{{ 'appointments.noAppointments' | translate }}</p>
      </div>
    </div>
  `
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  doctors: Doctor[] = [];
  filterDate = '';
  filterDoctorId: number | null = null;
  filterStatus: AppointmentStatus | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDoctors();
    this.loadAppointments();
  }

  loadDoctors() {
    this.api.getDoctors().subscribe(data => this.doctors = data);
  }

  loadAppointments() {
    this.api.getAppointments(
      this.filterDoctorId || undefined,
      undefined,
      this.filterDate || undefined,
      this.filterStatus ?? undefined
    ).subscribe(result => this.appointments = result.data);
  }

  getStatusClass(status: number): string {
    const classes: { [key: number]: string } = {
      0: 'bg-secondary',
      1: 'bg-primary',
      2: 'bg-info',
      3: 'bg-success',
      4: 'bg-danger',
      5: 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusText(status: number): string {
    const texts: { [key: number]: string } = {
      0: 'Pending',
      1: 'Confirmed',
      2: 'In Progress',
      3: 'Completed',
      4: 'Cancelled',
      5: 'No Show'
    };
    return texts[status] || 'Unknown';
  }

  cancelAppointment(id: number) {
    if (confirm(this.translate('appointments.cancelConfirm'))) {
      this.api.deleteAppointment(id).subscribe(() => this.loadAppointments());
    }
  }

  private translate(key: string): string {
    const translations: { [key: string]: string } = {
      'appointments.cancelConfirm': 'Are you sure you want to cancel this appointment?'
    };
    return translations[key] || key;
  }
}
