import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortalApiService } from '../../../core/services/portal-api.service';
import { Appointment, AppointmentStatus } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-portal-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    :host { display: block; animation: pageEnter 0.35s ease-out; }
    @keyframes pageEnter {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px;
    }
    .page-title {
      font-size: 1.25rem; font-weight: 700; color: var(--gray-900);
      margin: 0; letter-spacing: -0.025em;
    }
    .book-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-500) 100%);
      color: #fff; border-radius: var(--radius-md);
      text-decoration: none; font-size: 0.85rem; font-weight: 600;
      transition: all var(--transition-fast);
      box-shadow: 0 1px 3px rgba(var(--primary-rgb), 0.2);
    }
    .book-btn:hover {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      transform: translateY(-1px);
      box-shadow: var(--shadow-primary);
      color: #fff;
    }

    .card {
      background: #fff; border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xs); overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      padding: 14px 16px; text-align: left;
      background: var(--gray-50);
      font-size: 0.72rem; font-weight: 600;
      color: var(--gray-500); text-transform: uppercase;
      letter-spacing: 0.6px;
      border-bottom: 1px solid var(--border-color);
    }
    td {
      padding: 14px 16px; font-size: 0.85rem;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-100);
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--gray-50); }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.72rem; font-weight: 600;
    }
    .badge-pending { background: var(--warning-light); color: var(--warning-dark); }
    .badge-confirmed { background: var(--success-light); color: var(--success-dark); }
    .badge-cancelled { background: var(--danger-light); color: var(--danger-dark); }
    .badge-completed { background: var(--info-light); color: var(--info); }

    .cancel-btn {
      padding: 6px 14px; background: transparent;
      border: 1.5px solid #fecaca; color: var(--danger);
      border-radius: var(--radius-md); font-size: 0.8rem;
      cursor: pointer; transition: all var(--transition-fast);
      font-weight: 500; font-family: inherit;
    }
    .cancel-btn:hover {
      background: var(--danger-light);
      border-color: var(--danger);
    }

    .empty-state {
      text-align: center; padding: 48px; color: var(--gray-400);
      font-size: 0.85rem;
    }
    .empty-state a {
      color: var(--primary); text-decoration: none; font-weight: 500;
    }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal {
      background: #fff; border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      max-width: 400px; width: 90%;
      overflow: hidden;
      animation: modalEnter 0.2s ease-out;
    }
    @keyframes modalEnter {
      from { opacity: 0; transform: scale(0.95) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-header {
      padding: 20px 24px 0;
    }
    .modal-title {
      font-size: 1rem; font-weight: 700; color: var(--gray-900); margin: 0;
    }
    .modal-body {
      padding: 12px 24px 20px;
    }
    .modal-msg {
      font-size: 0.85rem; color: var(--gray-500); margin: 0; line-height: 1.6;
    }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
      display: flex; gap: 10px; justify-content: flex-end;
    }
    .btn-modal-cancel {
      padding: 9px 18px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: #fff; cursor: pointer;
      font-size: 0.85rem; color: var(--gray-600);
      font-family: inherit; font-weight: 500;
      transition: all var(--transition-fast);
    }
    .btn-modal-cancel:hover {
      background: var(--gray-50); border-color: var(--gray-300);
    }
    .btn-modal-confirm {
      padding: 9px 18px;
      background: var(--danger); color: #fff;
      border: none; border-radius: var(--radius-md);
      cursor: pointer; font-size: 0.85rem; font-weight: 600;
      font-family: inherit;
      transition: all var(--transition-fast);
    }
    .btn-modal-confirm:hover:not(:disabled) {
      background: var(--danger-dark);
    }
    .btn-modal-confirm:disabled {
      opacity: 0.55; cursor: not-allowed;
    }
  `],
  template: `
    <div class="page-header">
      <h1 class="page-title">My Appointments</h1>
      <a routerLink="/portal/appointments/book" class="book-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Book Appointment
      </a>
    </div>

    <div class="card">
      <ng-container *ngIf="appointments.length > 0; else emptyState">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Treatment</th>
              <th>Doctor</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let appt of appointments">
              <td>{{ appt.appointmentDate | date:'mediumDate' }}</td>
              <td>{{ appt.startTime }}</td>
              <td>{{ appt.treatmentName }}</td>
              <td>Dr. {{ appt.doctorName }}</td>
              <td>
                <span class="badge"
                  [class.badge-pending]="appt.status === 0"
                  [class.badge-confirmed]="appt.status === 1"
                  [class.badge-cancelled]="appt.status === 4"
                  [class.badge-completed]="appt.status === 3">
                  {{ getStatusLabel(appt.status) }}
                </span>
              </td>
              <td>
                <button class="cancel-btn" *ngIf="appt.status === 0" (click)="confirmCancel(appt)">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </ng-container>

      <ng-template #emptyState>
        <div class="empty-state">No appointments found. <a routerLink="/portal/appointments/book">Book one now.</a></div>
      </ng-template>
    </div>

    <!-- Cancel confirmation modal -->
    <div class="modal-overlay" *ngIf="appointmentToCancel">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Cancel appointment?</h2>
        </div>
        <div class="modal-body">
          <p class="modal-msg">
            Are you sure you want to cancel your appointment for
            <strong>{{ appointmentToCancel.treatmentName }}</strong> on
            {{ appointmentToCancel.appointmentDate | date:'mediumDate' }}?
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-modal-cancel" (click)="appointmentToCancel = null">Keep it</button>
          <button class="btn-modal-confirm" (click)="cancelAppointment()" [disabled]="cancelling">
            {{ cancelling ? 'Cancelling...' : 'Yes, cancel' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class PortalAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  appointmentToCancel: Appointment | null = null;
  cancelling = false;

  constructor(private portalApi: PortalApiService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.portalApi.getMyAppointments(undefined, 1, 50).subscribe({
      next: res => { this.appointments = res.data; }
    });
  }

  getStatusLabel(status: AppointmentStatus): string {
    const labels: Record<number, string> = {
      0: 'Pending', 1: 'Confirmed', 2: 'In Progress', 3: 'Completed', 4: 'Cancelled', 5: 'No Show'
    };
    return labels[status] ?? 'Unknown';
  }

  confirmCancel(appt: Appointment): void {
    this.appointmentToCancel = appt;
  }

  cancelAppointment(): void {
    if (!this.appointmentToCancel) return;
    this.cancelling = true;
    this.portalApi.cancelAppointment(this.appointmentToCancel.id).subscribe({
      next: () => {
        this.appointmentToCancel = null;
        this.cancelling = false;
        this.loadAppointments();
      },
      error: () => { this.cancelling = false; }
    });
  }
}
