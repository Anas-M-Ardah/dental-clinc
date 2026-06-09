import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { DoctorDashboardDto } from '../../../core/models/doctor-auth.model';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 4px; letter-spacing: -0.025em; }
    .page-sub { font-size: 0.9rem; color: var(--gray-500); margin-bottom: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 28px; }
    .kpi-card {
      background: #fff; border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 22px;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .kpi-label { font-size: 0.74rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .kpi-value { font-size: 2rem; font-weight: 700; color: var(--gray-900); letter-spacing: -0.03em; }
    .kpi-icon {
      width: 40px; height: 40px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 14px;
    }
    .kpi-icon.blue { background: #e0f2fe; color: #0284c7; }
    .kpi-icon.green { background: #dcfce7; color: #16a34a; }
    .kpi-icon.amber { background: #fef3c7; color: #d97706; }
    .kpi-icon.purple { background: #ede9fe; color: #7c3aed; }
    .section-title { font-size: 1.05rem; font-weight: 700; color: var(--gray-900); margin: 8px 0 14px; letter-spacing: -0.015em; }
    .schedule-card { background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
    .schedule-row {
      display: grid; grid-template-columns: 90px 1fr 130px 220px;
      align-items: center; gap: 14px; padding: 14px 18px;
      border-bottom: 1px solid var(--border-light);
    }
    .schedule-row:last-child { border-bottom: none; }
    .time-cell { font-weight: 700; color: #0284c7; font-size: 0.92rem; font-variant-numeric: tabular-nums; }
    .patient-cell .pname { font-weight: 600; color: var(--gray-900); font-size: 0.9rem; }
    .patient-cell .treatment { font-size: 0.78rem; color: var(--gray-500); margin-top: 2px; }
    .status-badge {
      display: inline-flex; align-items: center; padding: 4px 10px;
      border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 600;
    }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-confirmed { background: #dbeafe; color: #1d4ed8; }
    .badge-inprogress { background: #ede9fe; color: #6d28d9; }
    .badge-completed { background: #dcfce7; color: #15803d; }
    .badge-cancelled { background: #fee2e2; color: #b91c1c; }
    .badge-noshow { background: #f3f4f6; color: #4b5563; }
    .actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
    .btn-sm {
      padding: 6px 12px; border-radius: var(--radius-sm);
      font-size: 0.74rem; font-weight: 600; border: 1px solid transparent;
      cursor: pointer; transition: all var(--transition-fast);
      font-family: inherit;
    }
    .btn-confirm { background: #0284c7; color: #fff; }
    .btn-confirm:hover { background: #0369a1; }
    .btn-complete { background: #16a34a; color: #fff; }
    .btn-complete:hover { background: #15803d; }
    .btn-noshow { background: #fff; color: #b91c1c; border-color: #fecaca; }
    .btn-noshow:hover { background: #fee2e2; }
    .btn-view { background: #fff; color: var(--gray-700); border-color: var(--border-color); text-decoration: none; }
    .btn-view:hover { background: var(--gray-50); }
    .empty-state {
      padding: 56px 24px; text-align: center; color: var(--gray-500); font-size: 0.9rem;
    }
    .empty-icon { width: 56px; height: 56px; margin: 0 auto 12px; color: var(--gray-300); }
    .loading { padding: 36px; text-align: center; color: var(--gray-400); }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      backdrop-filter: blur(2px); display: flex; align-items: center;
      justify-content: center; z-index: 1500;
    }
    .modal-card {
      background: #fff; border-radius: var(--radius-lg); padding: 24px;
      width: 90%; max-width: 480px; box-shadow: var(--shadow-xl);
    }
    .modal-title { font-size: 1.05rem; font-weight: 700; color: var(--gray-900); margin-bottom: 12px; }
    .modal-textarea {
      width: 100%; min-height: 100px; padding: 10px 12px;
      border: 1.5px solid var(--border-color); border-radius: var(--radius-md);
      font-family: inherit; font-size: 0.85rem; resize: vertical; box-sizing: border-box;
    }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 14px; }
    .btn-cancel { background: var(--gray-100); color: var(--gray-700); border: none; padding: 8px 16px; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; font-size: 0.85rem; font-family: inherit; }
    .btn-submit { background: #16a34a; color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; font-size: 0.85rem; font-family: inherit; }
  `],
  template: `
    <h1 class="page-title">Welcome back</h1>
    <p class="page-sub">Here's what your day looks like.</p>

    <div *ngIf="loading" class="loading">Loading…</div>

    <ng-container *ngIf="!loading && data">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="kpi-label">Today's Appointments</div>
          <div class="kpi-value">{{ data.todayAppointmentCount }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="kpi-label">Completed Today</div>
          <div class="kpi-value">{{ data.completedToday }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="kpi-label">Patients Seen Today</div>
          <div class="kpi-value">{{ data.patientsSeenToday }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amber">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="kpi-label">Upcoming Appointments</div>
          <div class="kpi-value">{{ data.upcomingAppointmentCount }}</div>
        </div>
      </div>

      <h2 class="section-title">Today's Schedule</h2>
      <div class="schedule-card">
        <div *ngIf="data.todaySchedule.length === 0" class="empty-state">
          <svg class="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <div>No appointments scheduled for today.</div>
        </div>
        <div *ngFor="let a of data.todaySchedule" class="schedule-row">
          <div class="time-cell">{{ formatTime(a.startTime) }}</div>
          <div class="patient-cell">
            <div class="pname">{{ a.patientName }}</div>
            <div class="treatment">{{ a.treatmentName }}</div>
          </div>
          <div>
            <span class="status-badge" [ngClass]="badgeClass(a.status)">{{ statusLabel(a.status) }}</span>
          </div>
          <div class="actions">
            <button *ngIf="a.status === 0" class="btn-sm btn-confirm" (click)="confirm(a)">Confirm</button>
            <button *ngIf="a.status === 0 || a.status === 1 || a.status === 2" class="btn-sm btn-complete" (click)="openComplete(a)">Complete</button>
            <button *ngIf="a.status === 0 || a.status === 1" class="btn-sm btn-noshow" (click)="noShow(a)">No-show</button>
            <a class="btn-sm btn-view" [routerLink]="['/doctor/patients', a.patientId]">View</a>
          </div>
        </div>
      </div>
    </ng-container>

    <div *ngIf="completingAppt" class="modal-overlay" (click)="cancelComplete()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-title">Complete appointment for {{ completingAppt.patientName }}</div>
        <p style="font-size:0.85rem;color:var(--gray-600);margin:0 0 12px;">Optional notes will be appended to the appointment record.</p>
        <textarea class="modal-textarea" [(ngModel)]="completeNotes" placeholder="Clinical notes, observations, follow-up instructions…"></textarea>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="cancelComplete()">Cancel</button>
          <button class="btn-submit" (click)="submitComplete()" [disabled]="completing">{{ completing ? 'Saving…' : 'Mark Completed' }}</button>
        </div>
      </div>
    </div>
  `
})
export class DoctorDashboardComponent implements OnInit {
  data: DoctorDashboardDto | null = null;
  loading = true;
  completingAppt: Appointment | null = null;
  completeNotes = '';
  completing = false;

  constructor(private api: DoctorApiService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.api.getDashboard().subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  formatTime(t: string): string {
    if (!t) return '';
    const parts = t.split(':');
    if (parts.length < 2) return t;
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${m} ${period}`;
  }

  statusLabel(s: AppointmentStatus): string {
    return ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No-Show'][s] ?? 'Unknown';
  }

  badgeClass(s: AppointmentStatus): string {
    return ['badge-pending', 'badge-confirmed', 'badge-inprogress', 'badge-completed', 'badge-cancelled', 'badge-noshow'][s] ?? '';
  }

  confirm(a: Appointment): void {
    this.api.confirmAppointment(a.id).subscribe(() => this.load());
  }

  openComplete(a: Appointment): void {
    this.completingAppt = a;
    this.completeNotes = '';
  }

  cancelComplete(): void {
    this.completingAppt = null;
    this.completeNotes = '';
  }

  submitComplete(): void {
    if (!this.completingAppt) return;
    this.completing = true;
    this.api.completeAppointment(this.completingAppt.id, { notes: this.completeNotes || undefined }).subscribe({
      next: () => { this.completing = false; this.cancelComplete(); this.load(); },
      error: () => { this.completing = false; }
    });
  }

  noShow(a: Appointment): void {
    if (!confirm(`Mark ${a.patientName}'s appointment as No-show?`)) return;
    this.api.markNoShow(a.id).subscribe(() => this.load());
  }
}
