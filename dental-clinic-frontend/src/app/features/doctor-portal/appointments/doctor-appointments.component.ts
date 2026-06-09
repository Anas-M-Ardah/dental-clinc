import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';

type Filter = 'today' | 'upcoming' | 'past';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 4px; letter-spacing: -0.025em; }
    .page-sub { font-size: 0.9rem; color: var(--gray-500); margin-bottom: 20px; }
    .tabs {
      display: inline-flex; padding: 4px; background: var(--gray-100);
      border-radius: var(--radius-md); margin-bottom: 20px;
    }
    .tab-btn {
      padding: 8px 18px; border: none; background: transparent;
      font-size: 0.85rem; font-weight: 600; color: var(--gray-600);
      cursor: pointer; border-radius: var(--radius-sm); font-family: inherit;
      transition: all var(--transition-fast);
    }
    .tab-btn.active { background: #fff; color: #0284c7; box-shadow: var(--shadow-sm); }
    .table-card { background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { background: var(--gray-50); font-size: 0.72rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 1px; padding: 12px 18px; text-align: left; border-bottom: 1px solid var(--border-light); }
    .table td { padding: 14px 18px; border-bottom: 1px solid var(--border-light); font-size: 0.88rem; color: var(--gray-800); vertical-align: middle; }
    .table tr:last-child td { border-bottom: none; }
    .date-cell { font-weight: 600; color: var(--gray-900); font-variant-numeric: tabular-nums; }
    .time-cell { color: #0284c7; font-weight: 600; font-variant-numeric: tabular-nums; }
    .pname { font-weight: 600; color: var(--gray-900); }
    .treatment-text { color: var(--gray-500); font-size: 0.78rem; margin-top: 2px; }
    .status-badge { display: inline-flex; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 600; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-confirmed { background: #dbeafe; color: #1d4ed8; }
    .badge-inprogress { background: #ede9fe; color: #6d28d9; }
    .badge-completed { background: #dcfce7; color: #15803d; }
    .badge-cancelled { background: #fee2e2; color: #b91c1c; }
    .badge-noshow { background: #f3f4f6; color: #4b5563; }
    .actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
    .btn-sm { padding: 6px 10px; border-radius: var(--radius-sm); font-size: 0.74rem; font-weight: 600; border: 1px solid transparent; cursor: pointer; transition: all var(--transition-fast); font-family: inherit; }
    .btn-confirm { background: #0284c7; color: #fff; }
    .btn-confirm:hover { background: #0369a1; }
    .btn-complete { background: #16a34a; color: #fff; }
    .btn-complete:hover { background: #15803d; }
    .btn-noshow { background: #fff; color: #b91c1c; border-color: #fecaca; }
    .btn-noshow:hover { background: #fee2e2; }
    .btn-view { background: #fff; color: var(--gray-700); border-color: var(--border-color); text-decoration: none; }
    .btn-view:hover { background: var(--gray-50); }
    .empty-state { padding: 56px 24px; text-align: center; color: var(--gray-500); font-size: 0.9rem; }
    .loading { padding: 36px; text-align: center; color: var(--gray-400); }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-top: 1px solid var(--border-light); font-size: 0.82rem; color: var(--gray-600); }
    .page-btn { padding: 6px 12px; background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; font-size: 0.78rem; color: var(--gray-700); font-family: inherit; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 1500; }
    .modal-card { background: #fff; border-radius: var(--radius-lg); padding: 24px; width: 90%; max-width: 480px; box-shadow: var(--shadow-xl); }
    .modal-title { font-size: 1.05rem; font-weight: 700; color: var(--gray-900); margin-bottom: 12px; }
    .modal-textarea { width: 100%; min-height: 100px; padding: 10px 12px; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); font-family: inherit; font-size: 0.85rem; resize: vertical; box-sizing: border-box; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 14px; }
    .btn-cancel { background: var(--gray-100); color: var(--gray-700); border: none; padding: 8px 16px; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; font-size: 0.85rem; font-family: inherit; }
    .btn-submit { background: #16a34a; color: #fff; border: none; padding: 8px 16px; border-radius: var(--radius-md); cursor: pointer; font-weight: 600; font-size: 0.85rem; font-family: inherit; }
  `],
  template: `
    <h1 class="page-title">Appointments</h1>
    <p class="page-sub">Manage your schedule, confirm arrivals, and complete visits.</p>

    <div class="tabs">
      <button class="tab-btn" [class.active]="filter === 'today'" (click)="setFilter('today')">Today</button>
      <button class="tab-btn" [class.active]="filter === 'upcoming'" (click)="setFilter('upcoming')">Upcoming</button>
      <button class="tab-btn" [class.active]="filter === 'past'" (click)="setFilter('past')">Past</button>
    </div>

    <div class="table-card">
      <div *ngIf="loading" class="loading">Loading…</div>
      <div *ngIf="!loading && appointments.length === 0" class="empty-state">No appointments in this view.</div>

      <table class="table" *ngIf="!loading && appointments.length > 0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Patient</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of appointments">
            <td class="date-cell">{{ formatDate(a.appointmentDate) }}</td>
            <td class="time-cell">{{ formatTime(a.startTime) }}</td>
            <td>
              <div class="pname">{{ a.patientName }}</div>
              <div class="treatment-text">{{ a.treatmentName }}</div>
            </td>
            <td><span class="status-badge" [ngClass]="badgeClass(a.status)">{{ statusLabel(a.status) }}</span></td>
            <td>
              <div class="actions">
                <button *ngIf="a.status === 0" class="btn-sm btn-confirm" (click)="confirm(a)">Confirm</button>
                <button *ngIf="(a.status === 0 || a.status === 1 || a.status === 2)" class="btn-sm btn-complete" (click)="openComplete(a)">Complete</button>
                <button *ngIf="(a.status === 0 || a.status === 1)" class="btn-sm btn-noshow" (click)="noShow(a)">No-show</button>
                <a class="btn-sm btn-view" [routerLink]="['/doctor/patients', a.patientId]">View patient</a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" *ngIf="!loading && totalCount > pageSize">
        <span>Showing {{ (pageNumber - 1) * pageSize + 1 }}–{{ pageEnd }} of {{ totalCount }}</span>
        <div style="display: flex; gap: 8px;">
          <button class="page-btn" [disabled]="pageNumber === 1" (click)="changePage(pageNumber - 1)">Previous</button>
          <button class="page-btn" [disabled]="pageEnd >= totalCount" (click)="changePage(pageNumber + 1)">Next</button>
        </div>
      </div>
    </div>

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
export class DoctorAppointmentsComponent implements OnInit {
  filter: Filter = 'today';
  appointments: Appointment[] = [];
  loading = false;
  pageNumber = 1;
  pageSize = 20;
  totalCount = 0;

  completingAppt: Appointment | null = null;
  completeNotes = '';
  completing = false;

  constructor(private api: DoctorApiService) {}

  ngOnInit(): void {
    this.load();
  }

  get pageEnd(): number {
    return Math.min(this.pageNumber * this.pageSize, this.totalCount);
  }

  setFilter(f: Filter): void {
    this.filter = f;
    this.pageNumber = 1;
    this.load();
  }

  changePage(n: number): void {
    this.pageNumber = n;
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.api.getAppointments(this.filter, undefined, this.pageNumber, this.pageSize).subscribe({
      next: res => {
        this.appointments = res.data;
        this.totalCount = res.totalCount;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  formatDate(d: string): string {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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
