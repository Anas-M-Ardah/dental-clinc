import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, DashboardStats, TodaySchedule } from '../../core/services/api.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <h2 class="mb-4">{{ 'dashboard.title' | translate }}</h2>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <h5 class="card-title">{{ 'dashboard.todaysAppointments' | translate }}</h5>
            <h2>{{ stats?.todayAppointments || 0 }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <h5 class="card-title">{{ 'dashboard.totalPatients' | translate }}</h5>
            <h2>{{ stats?.totalPatients || 0 }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-dark">
          <div class="card-body">
            <h5 class="card-title">{{ 'dashboard.monthlyRevenue' | translate }}</h5>
            <h2>\${{ stats?.monthlyRevenue || 0 }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-danger text-white">
          <div class="card-body">
            <h5 class="card-title">{{ 'dashboard.pendingInvoices' | translate }}</h5>
            <h2>{{ stats?.pendingInvoices || 0 }}</h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Schedule -->
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">{{ 'dashboard.todaysSchedule' | translate }}</h5>
            <a routerLink="/appointments" class="btn btn-sm btn-primary">{{ 'dashboard.viewAll' | translate }}</a>
          </div>
          <div class="card-body">
            <table class="table table-hover" *ngIf="todaySchedule?.appointments?.length">
              <thead>
                <tr>
                  <th>{{ 'common.time' | translate }}</th>
                  <th>{{ 'appointments.patient' | translate }}</th>
                  <th>{{ 'appointments.doctor' | translate }}</th>
                  <th>{{ 'appointments.treatment' | translate }}</th>
                  <th>{{ 'common.status' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let apt of todaySchedule?.appointments">
                  <td>{{ apt.startTime }}</td>
                  <td>{{ apt.patientName }}</td>
                  <td>{{ apt.doctorName }}</td>
                  <td>{{ apt.treatmentName }}</td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(apt.status)">
                      {{ getStatusText(apt.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="text-muted" *ngIf="!todaySchedule?.appointments?.length">
              {{ 'dashboard.noAppointmentsToday' | translate }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ 'dashboard.quickActions' | translate }}</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <a routerLink="/patients/new" class="btn btn-primary">{{ 'dashboard.newPatient' | translate }}</a>
              <a routerLink="/appointments/new" class="btn btn-success">{{ 'dashboard.newAppointment' | translate }}</a>
              <a routerLink="/invoices" class="btn btn-warning">{{ 'dashboard.viewInvoices' | translate }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  todaySchedule: TodaySchedule | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getDashboardStats().subscribe(data => this.stats = data);
    this.api.getTodaySchedule().subscribe(data => this.todaySchedule = data);
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
    const key = 'appointmentStatus.' + status;
    return this.translateStatus(key);
  }

  private translateStatus(key: string): string {
    const translations: { [key: string]: string } = {
      'appointmentStatus.0': 'Pending',
      'appointmentStatus.1': 'Confirmed',
      'appointmentStatus.2': 'In Progress',
      'appointmentStatus.3': 'Completed',
      'appointmentStatus.4': 'Cancelled',
      'appointmentStatus.5': 'No Show'
    };
    return translations[key] || key;
  }
}
