import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { Doctor } from '../../core/models/doctor.model';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header">
      <h2>{{ 'appointments.title' | translate }}</h2>
      <a routerLink="/appointments/new" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ 'appointments.newAppointment' | translate }}
      </a>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-item">
        <label class="form-label">{{ 'common.date' | translate }}</label>
        <input type="date" class="form-control" [(ngModel)]="filterDate" (change)="loadAppointments()">
      </div>
      <div class="filter-item">
        <label class="form-label">{{ 'appointments.doctor' | translate }}</label>
        <select class="form-select" [(ngModel)]="filterDoctorId" (change)="loadAppointments()">
          <option [ngValue]="null">{{ 'appointments.allDoctors' | translate }}</option>
          <option *ngFor="let d of doctors; trackBy: trackById" [ngValue]="d.id">
            Dr. {{ d.firstName }} {{ d.lastName }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <label class="form-label">{{ 'common.status' | translate }}</label>
        <select class="form-select" [(ngModel)]="filterStatus" (change)="loadAppointments()">
          <option [ngValue]="null">{{ 'common.all' | translate }}</option>
          <option [ngValue]="0">{{ 'appointments.pending' | translate }}</option>
          <option [ngValue]="1">{{ 'appointments.confirmed' | translate }}</option>
          <option [ngValue]="2">{{ 'appointments.inProgress' | translate }}</option>
          <option [ngValue]="3">{{ 'appointments.completed' | translate }}</option>
          <option [ngValue]="4">{{ 'appointments.cancelled' | translate }}</option>
        </select>
      </div>
    </div>

    <!-- Appointments Table -->
    <div class="card">
      <div class="card-body" style="padding: 0;">
        <div *ngIf="loading" class="text-center py-4 text-muted">{{ 'common.loading' | translate }}</div>
        <div class="table-responsive" *ngIf="!loading && appointments.length">
          <table class="table mb-0">
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
              <tr *ngFor="let apt of appointments; trackBy: trackById">
                <td>{{ apt.appointmentDate | date:'mediumDate' }}</td>
                <td><span class="time-badge">{{ apt.startTime }}</span></td>
                <td><strong>{{ apt.patientName }}</strong></td>
                <td>{{ apt.doctorName }}</td>
                <td>{{ apt.treatmentName }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(apt.status)">
                    {{ getStatusText(apt.status) }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-danger"
                          *ngIf="apt.status !== 4 && apt.status !== 3"
                          (click)="cancelAppointment(apt.id)">{{ 'appointments.cancelAppointment' | translate }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="!loading && !appointments.length">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="color: var(--gray-300);">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p>{{ 'appointments.noAppointments' | translate }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
    }
    .filters-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      padding: 20px 24px;
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xs);
    }
    .filter-item {
      flex: 1;
      min-width: 0;
    }
    .table-responsive { overflow-x: auto; }
    .time-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      background: var(--gray-100);
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--gray-700);
      font-variant-numeric: tabular-nums;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      gap: 12px;
    }
    .empty-state p {
      color: var(--gray-400);
      font-weight: 500;
      margin: 0;
    }
    @media (max-width: 768px) {
      .filters-bar {
        flex-direction: column;
      }
    }
  `]
})
export class AppointmentsComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  doctors: Doctor[] = [];
  filterDate = '';
  filterDoctorId: number | null = null;
  filterStatus: AppointmentStatus | null = null;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private translation: TranslationService
  ) {}

  ngOnInit() {
    this.loadDoctors();
    this.loadAppointments();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  loadDoctors() {
    this.api.getDoctors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.doctors = data });
  }

  loadAppointments() {
    this.loading = true;
    this.api.getAppointments(
      this.filterDoctorId || undefined,
      undefined,
      this.filterDate || undefined,
      this.filterStatus ?? undefined
    ).pipe(takeUntil(this.destroy$))
     .subscribe({
       next: result => { this.appointments = result.data; this.loading = false; },
       error: () => this.loading = false
     });
  }

  getStatusClass(status: number): string {
    const classes: { [key: number]: string } = {
      0: 'bg-secondary', 1: 'bg-primary', 2: 'bg-info',
      3: 'bg-success', 4: 'bg-danger', 5: 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusText(status: number): string {
    return this.translation.instant('appointmentStatus.' + status);
  }

  cancelAppointment(id: number) {
    if (confirm(this.translation.instant('appointments.cancelConfirm'))) {
      this.api.deleteAppointment(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAppointments());
    }
  }
}
