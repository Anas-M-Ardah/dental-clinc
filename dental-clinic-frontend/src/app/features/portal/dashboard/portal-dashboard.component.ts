import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortalApiService } from '../../../core/services/portal-api.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';
import { Invoice } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    :host { display: block; animation: pageEnter 0.35s ease-out; }
    @keyframes pageEnter {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header { margin-bottom: 28px; }
    .page-title {
      font-size: 1.5rem; font-weight: 700; color: var(--gray-900);
      margin: 0 0 4px; letter-spacing: -0.025em;
    }
    .page-subtitle { color: var(--gray-500); font-size: 0.85rem; margin: 0; }

    /* Stat Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 20px; margin-bottom: 28px;
    }
    .stat-card {
      background: #fff;
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      display: flex; align-items: flex-start; gap: 18px;
      transition: all var(--transition);
      position: relative; overflow: hidden;
    }
    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .stat-icon {
      width: 50px; height: 50px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon svg { width: 24px; height: 24px; stroke-width: 1.8; }
    .stat-icon.primary {
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-50) 100%);
      color: var(--primary);
    }
    .stat-icon.warning {
      background: linear-gradient(135deg, var(--warning-light) 0%, #fef3c7 100%);
      color: var(--warning-dark);
    }
    .stat-content { flex: 1; min-width: 0; }
    .stat-value {
      font-size: 1.75rem; font-weight: 800; color: var(--gray-900);
      line-height: 1.2; letter-spacing: -0.03em;
    }
    .stat-label {
      font-size: 0.8rem; color: var(--gray-500);
      margin-top: 4px; font-weight: 500;
    }
    .stat-action {
      margin-top: 8px;
    }
    .stat-action a {
      font-size: 0.8rem; color: var(--primary); text-decoration: none;
      font-weight: 500; transition: color var(--transition-fast);
    }
    .stat-action a:hover { color: var(--primary-dark); }

    /* Appointments Section */
    .section-card {
      background: #fff; border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xs); overflow: hidden;
    }
    .section-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex; align-items: center; justify-content: space-between;
    }
    .section-title {
      font-size: 0.95rem; font-weight: 600; color: var(--gray-800); margin: 0;
    }
    .section-body { padding: 24px; }

    .appt-item {
      padding: 14px 0; border-bottom: 1px solid var(--gray-100);
      display: flex; align-items: center; gap: 16px;
    }
    .appt-item:last-child { border-bottom: none; padding-bottom: 0; }
    .appt-date {
      min-width: 64px; text-align: center;
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-50) 100%);
      border-radius: var(--radius-md); padding: 10px 8px;
    }
    .appt-date-day {
      font-size: 1.25rem; font-weight: 800; color: var(--primary);
      line-height: 1; letter-spacing: -0.02em;
    }
    .appt-date-mon { font-size: 0.72rem; color: var(--primary-500); font-weight: 500; margin-top: 2px; }
    .appt-info { flex: 1; }
    .appt-name { font-weight: 600; color: var(--gray-800); font-size: 0.9rem; }
    .appt-detail { font-size: 0.8rem; color: var(--gray-500); margin-top: 3px; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.72rem; font-weight: 600;
    }
    .badge-pending { background: var(--warning-light); color: var(--warning-dark); }
    .badge-confirmed { background: var(--success-light); color: var(--success-dark); }
    .empty-state {
      text-align: center; color: var(--gray-400);
      padding: 32px 0; font-size: 0.85rem;
    }

    .book-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-500) 100%);
      color: #fff; border-radius: var(--radius-md);
      text-decoration: none; font-size: 0.85rem; font-weight: 600;
      transition: all var(--transition-fast);
      box-shadow: 0 1px 3px rgba(var(--primary-rgb), 0.2);
      margin-top: 16px;
    }
    .book-btn:hover {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      transform: translateY(-1px);
      box-shadow: var(--shadow-primary);
      color: #fff;
    }
  `],
  template: `
    <div class="page-header">
      <h1 class="page-title">Welcome back!</h1>
      <p class="page-subtitle">Here's a summary of your health information.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ upcomingCount }}</div>
          <div class="stat-label">Upcoming Appointments</div>
          <div class="stat-action"><a routerLink="/portal/appointments">View all</a></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ pendingInvoiceCount }}</div>
          <div class="stat-label">Pending Invoices</div>
          <div class="stat-action"><a routerLink="/portal/invoices">View all</a></div>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">Upcoming Appointments</h2>
      </div>
      <div class="section-body">
        <ng-container *ngIf="upcomingAppointments.length > 0; else noAppointments">
          <div class="appt-item" *ngFor="let appt of upcomingAppointments">
            <div class="appt-date">
              <div class="appt-date-day">{{ appt.appointmentDate | date:'d' }}</div>
              <div class="appt-date-mon">{{ appt.appointmentDate | date:'MMM' }}</div>
            </div>
            <div class="appt-info">
              <div class="appt-name">{{ appt.treatmentName }}</div>
              <div class="appt-detail">Dr. {{ appt.doctorName }} &middot; {{ appt.startTime }}</div>
            </div>
            <span class="badge" [class.badge-pending]="appt.status === 0" [class.badge-confirmed]="appt.status === 1">
              {{ appt.status === 0 ? 'Pending' : 'Confirmed' }}
            </span>
          </div>
        </ng-container>

        <ng-template #noAppointments>
          <div class="empty-state">No upcoming appointments</div>
        </ng-template>

        <a routerLink="/portal/appointments/book" class="book-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Book Appointment
        </a>
      </div>
    </div>
  `
})
export class PortalDashboardComponent implements OnInit {
  upcomingAppointments: Appointment[] = [];
  upcomingCount = 0;
  pendingInvoiceCount = 0;

  constructor(private portalApi: PortalApiService) {}

  ngOnInit(): void {
    this.portalApi.getMyAppointments(AppointmentStatus.Pending, 1, 5).subscribe({
      next: res => {
        this.upcomingAppointments = res.data;
        this.upcomingCount = res.totalCount;
      }
    });

    this.portalApi.getMyInvoices(0, 1, 1).subscribe({
      next: res => { this.pendingInvoiceCount = res.totalCount; }
    });
  }
}
