import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Doctor } from '../../core/models/doctor.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header">
      <h2>{{ 'doctors.title' | translate }}</h2>
    </div>

    <div *ngIf="loading" class="text-center py-4 text-muted">{{ 'common.loading' | translate }}</div>

    <div class="doctors-grid" *ngIf="!loading && doctors.length">
      <div class="doctor-card" *ngFor="let doctor of doctors; trackBy: trackById">
        <div class="doctor-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4h-1"/>
            <circle cx="15" cy="7" r="4"/>
            <path d="M8 11v4"/>
            <path d="M6 13h4"/>
          </svg>
        </div>
        <div class="doctor-info">
          <h5 class="doctor-name">Dr. {{ doctor.firstName }} {{ doctor.lastName }}</h5>
          <span class="doctor-spec">{{ doctor.specialization }}</span>
        </div>
        <div class="doctor-details">
          <div class="detail-row">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>{{ doctor.phone }}</span>
          </div>
          <div class="detail-row" *ngIf="doctor.email">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>{{ doctor.email }}</span>
          </div>
        </div>
        <div class="doctor-status">
          <span class="status-dot" [class.available]="doctor.isAvailable" [class.unavailable]="!doctor.isAvailable"></span>
          <span>{{ (doctor.isAvailable ? 'doctors.available' : 'doctors.unavailable') | translate }}</span>
        </div>

        <button class="btn-manage" (click)="toggleSchedule(doctor.id)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {{ expandedDoctor === doctor.id ? 'Hide Schedule' : 'Manage Schedule' }}
        </button>

        <!-- Schedule Management Panel -->
        <div class="schedule-panel" *ngIf="expandedDoctor === doctor.id">
          <h6 class="panel-title">Working Hours</h6>
          <div class="wh-grid">
            <div class="wh-row" *ngFor="let wh of workingHours">
              <div class="wh-day">
                <label class="toggle-switch small">
                  <input type="checkbox" [checked]="wh.isWorkingDay" (change)="wh.isWorkingDay = !wh.isWorkingDay; saveWorkingHours(doctor.id, wh)">
                  <span class="toggle-slider"></span>
                </label>
                <span class="day-name">{{ wh.dayName }}</span>
              </div>
              <div class="wh-times" *ngIf="wh.isWorkingDay">
                <input type="time" class="time-input" [value]="formatTime(wh.startTime)" (change)="wh.startTime = parseTime($event); saveWorkingHours(doctor.id, wh)">
                <span class="time-sep">to</span>
                <input type="time" class="time-input" [value]="formatTime(wh.endTime)" (change)="wh.endTime = parseTime($event); saveWorkingHours(doctor.id, wh)">
                <select class="slot-select" [value]="wh.slotDurationMinutes" (change)="wh.slotDurationMinutes = +getValue($event); saveWorkingHours(doctor.id, wh)">
                  <option value="15">15m</option>
                  <option value="30">30m</option>
                  <option value="45">45m</option>
                  <option value="60">60m</option>
                </select>
                <select class="slot-select" [value]="wh.bufferMinutes" (change)="wh.bufferMinutes = +getValue($event); saveWorkingHours(doctor.id, wh)">
                  <option value="0">0m buf</option>
                  <option value="5">5m buf</option>
                  <option value="10">10m buf</option>
                  <option value="15">15m buf</option>
                </select>
              </div>
              <div class="wh-off" *ngIf="!wh.isWorkingDay">Day off</div>
            </div>
          </div>

          <h6 class="panel-title" style="margin-top: 20px;">
            Upcoming Leaves
            <button class="btn-add-leave" (click)="showLeaveForm = !showLeaveForm">+ Add</button>
          </h6>
          <div class="leave-form" *ngIf="showLeaveForm">
            <input type="date" class="time-input" [(ngModel)]="newLeave.startDate">
            <input type="date" class="time-input" [(ngModel)]="newLeave.endDate">
            <input type="text" class="time-input reason" placeholder="Reason" [(ngModel)]="newLeave.reason">
            <button class="btn-save-leave" (click)="addLeave(doctor.id)">Save</button>
          </div>
          <div class="leave-list">
            <div class="leave-item" *ngFor="let leave of leaves">
              <div class="leave-dates">{{ leave.startDate | date:'MMM dd' }} - {{ leave.endDate | date:'MMM dd, yyyy' }}</div>
              <div class="leave-reason" *ngIf="leave.reason">{{ leave.reason }}</div>
              <button class="btn-delete-leave" (click)="deleteLeave(doctor.id, leave.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="empty-leaves" *ngIf="!leaves.length">No upcoming leaves</div>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!loading && !doctors.length">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="color: var(--gray-300);">
        <path d="M20 21v-2a4 4 0 0 0-4-4h-1"/><circle cx="15" cy="7" r="4"/><path d="M8 11v4"/><path d="M6 13h4"/>
      </svg>
      <p>{{ 'doctors.noDoctors' | translate }}</p>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; }
    .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .doctor-card {
      background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg);
      padding: 24px; box-shadow: var(--shadow-xs); display: flex; flex-direction: column; gap: 16px;
    }
    .doctor-avatar {
      width: 56px; height: 56px; border-radius: var(--radius-lg);
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-50) 100%);
      color: var(--primary); display: flex; align-items: center; justify-content: center;
    }
    .doctor-info { display: flex; flex-direction: column; gap: 4px; }
    .doctor-name { font-size: 1rem; font-weight: 700; margin: 0; color: var(--gray-900); }
    .doctor-spec { font-size: 0.82rem; color: var(--primary); font-weight: 500; }
    .doctor-details { display: flex; flex-direction: column; gap: 8px; }
    .detail-row { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--gray-500); }
    .detail-row svg { color: var(--gray-400); flex-shrink: 0; }
    .doctor-status {
      display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 500;
      padding-top: 12px; border-top: 1px solid var(--border-color);
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; }
    .status-dot.available { background: var(--success); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .status-dot.unavailable { background: var(--danger); box-shadow: 0 0 0 3px rgba(239,68,68,0.15); }

    .btn-manage {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 8px 16px; background: var(--gray-50); border: 1px solid var(--border-color);
      border-radius: var(--radius-md); color: var(--gray-600); font-size: 0.8rem;
      font-weight: 600; cursor: pointer; font-family: inherit; transition: all var(--transition-fast);
    }
    .btn-manage:hover { background: var(--primary-light); color: var(--primary); border-color: var(--primary-200); }

    .schedule-panel {
      padding-top: 16px; border-top: 1px solid var(--border-color);
      animation: slideDown 0.2s ease-out;
    }
    @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 1000px; } }

    .panel-title {
      font-size: 0.82rem; font-weight: 700; color: var(--gray-900); margin: 0 0 12px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .wh-grid { display: flex; flex-direction: column; gap: 8px; }
    .wh-row {
      display: flex; align-items: center; gap: 10px; padding: 6px 0;
      border-bottom: 1px solid var(--border-light);
    }
    .wh-day { display: flex; align-items: center; gap: 8px; min-width: 120px; }
    .day-name { font-size: 0.78rem; font-weight: 600; color: var(--gray-700); }
    .wh-times { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .wh-off { font-size: 0.75rem; color: var(--gray-400); font-style: italic; }
    .time-input {
      padding: 4px 8px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
      font-size: 0.75rem; font-family: inherit; color: var(--gray-700); outline: none;
    }
    .time-input:focus { border-color: var(--primary); }
    .time-input.reason { flex: 1; min-width: 100px; }
    .time-sep { font-size: 0.72rem; color: var(--gray-400); }
    .slot-select {
      padding: 4px 6px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
      font-size: 0.72rem; font-family: inherit; color: var(--gray-600); background: #fff; outline: none;
    }

    .toggle-switch { position: relative; width: 32px; height: 18px; cursor: pointer; display: inline-block; }
    .toggle-switch.small { width: 32px; height: 18px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: var(--gray-300); border-radius: 18px; transition: background var(--transition-fast);
    }
    .toggle-slider::before {
      content: ''; position: absolute; height: 14px; width: 14px; left: 2px; bottom: 2px;
      background: #fff; border-radius: 50%; transition: transform var(--transition-fast);
    }
    .toggle-switch input:checked + .toggle-slider { background: var(--primary); }
    .toggle-switch input:checked + .toggle-slider::before { transform: translateX(14px); }

    .btn-add-leave {
      padding: 3px 10px; background: var(--primary-light); color: var(--primary);
      border: none; border-radius: var(--radius-sm); font-size: 0.72rem; font-weight: 600;
      cursor: pointer; font-family: inherit;
    }
    .leave-form { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
    .btn-save-leave {
      padding: 5px 14px; background: var(--primary); color: #fff; border: none;
      border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit;
    }
    .leave-list { display: flex; flex-direction: column; gap: 6px; }
    .leave-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 10px;
      background: var(--gray-50); border-radius: var(--radius-sm); font-size: 0.78rem;
    }
    .leave-dates { font-weight: 600; color: var(--gray-700); }
    .leave-reason { color: var(--gray-500); flex: 1; }
    .btn-delete-leave {
      width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
      background: none; border: none; color: var(--gray-400); cursor: pointer; border-radius: var(--radius-sm);
    }
    .btn-delete-leave:hover { color: var(--danger); background: var(--danger-light); }
    .empty-leaves { font-size: 0.78rem; color: var(--gray-400); font-style: italic; padding: 8px 0; }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px 24px; gap: 12px; }
    .empty-state p { color: var(--gray-400); font-weight: 500; margin: 0; }
  `]
})
export class DoctorsComponent implements OnInit, OnDestroy {
  doctors: Doctor[] = [];
  loading = false;
  expandedDoctor: number | null = null;
  workingHours: any[] = [];
  leaves: any[] = [];
  showLeaveForm = false;
  newLeave = { startDate: '', endDate: '', reason: '' };
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getDoctors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.doctors = data; this.loading = false; },
        error: () => this.loading = false
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  toggleSchedule(doctorId: number): void {
    if (this.expandedDoctor === doctorId) {
      this.expandedDoctor = null;
      return;
    }
    this.expandedDoctor = doctorId;
    this.showLeaveForm = false;
    this.loadScheduleData(doctorId);
  }

  private loadScheduleData(doctorId: number): void {
    this.api.getDoctorWorkingHours(doctorId).subscribe(wh => {
      // Fill in all 7 days
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      this.workingHours = days.map((name, i) => {
        const existing = wh.find((h: any) => h.dayOfWeek === i);
        return existing || {
          dayOfWeek: i, dayName: name, startTime: '08:00:00', endTime: '17:00:00',
          slotDurationMinutes: 30, bufferMinutes: 0, isWorkingDay: false
        };
      });
    });
    this.api.getDoctorLeaves(doctorId).subscribe(l => this.leaves = l);
  }

  saveWorkingHours(doctorId: number, wh: any): void {
    this.api.upsertDoctorWorkingHours(doctorId, {
      dayOfWeek: wh.dayOfWeek,
      startTime: wh.startTime,
      endTime: wh.endTime,
      slotDurationMinutes: wh.slotDurationMinutes,
      bufferMinutes: wh.bufferMinutes,
      isWorkingDay: wh.isWorkingDay
    }).subscribe();
  }

  addLeave(doctorId: number): void {
    if (!this.newLeave.startDate || !this.newLeave.endDate) return;
    this.api.addDoctorLeave(doctorId, this.newLeave).subscribe({
      next: () => {
        this.showLeaveForm = false;
        this.newLeave = { startDate: '', endDate: '', reason: '' };
        this.api.getDoctorLeaves(doctorId).subscribe(l => this.leaves = l);
      }
    });
  }

  deleteLeave(doctorId: number, leaveId: number): void {
    this.api.deleteDoctorLeave(doctorId, leaveId).subscribe(() => {
      this.leaves = this.leaves.filter(l => l.id !== leaveId);
    });
  }

  formatTime(time: string): string {
    if (!time) return '08:00';
    const parts = time.split(':');
    return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`;
  }

  parseTime(event: Event): string {
    const val = (event.target as HTMLInputElement).value;
    return val + ':00';
  }

  getValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
