import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { DoctorLeaveDto, DoctorWorkingHoursDto, UpsertWorkingHoursDto } from '../../../core/models/doctor-auth.model';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@Component({
  selector: 'app-doctor-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 4px; }
    .page-sub { font-size: 0.9rem; color: var(--gray-500); margin-bottom: 24px; }
    .panel { background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 20px; }
    .panel h2 { font-size: 1.05rem; font-weight: 700; color: var(--gray-900); margin: 0 0 14px; }
    .hours-table { width: 100%; border-collapse: collapse; }
    .hours-table th { background: var(--gray-50); font-size: 0.72rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 1px; padding: 10px; text-align: left; border-bottom: 1px solid var(--border-light); }
    .hours-table td { padding: 10px; border-bottom: 1px solid var(--border-light); font-size: 0.85rem; }
    .hours-input { padding: 6px 8px; border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit; font-size: 0.82rem; width: 110px; box-sizing: border-box; }
    .num-input { padding: 6px 8px; border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit; font-size: 0.82rem; width: 70px; box-sizing: border-box; }
    .btn-sm { padding: 6px 12px; border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 600; border: none; cursor: pointer; font-family: inherit; background: #0284c7; color: #fff; }
    .btn-sm:hover:not(:disabled) { background: #0369a1; }
    .btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }
    .leave-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid var(--border-light); border-radius: var(--radius-md); margin-bottom: 6px; font-size: 0.86rem; }
    .add-leave-form { display: grid; grid-template-columns: 1fr 1fr 2fr auto; gap: 10px; margin-top: 12px; align-items: center; }
    .add-leave-form input { padding: 8px 10px; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); font-family: inherit; font-size: 0.82rem; box-sizing: border-box; }
    .del-btn { color: #b91c1c; background: none; border: none; cursor: pointer; font-size: 0.78rem; font-weight: 600; }
    .loading { padding: 28px; text-align: center; color: var(--gray-400); }
    .toast { position: fixed; bottom: 24px; right: 24px; background: var(--gray-900); color: #fff; padding: 10px 18px; border-radius: var(--radius-md); font-size: 0.85rem; box-shadow: var(--shadow-xl); z-index: 2000; }
    .check { width: 16px; height: 16px; }
  `],
  template: `
    <h1 class="page-title">My Schedule</h1>
    <p class="page-sub">Manage your weekly working hours and request days off.</p>

    <div *ngIf="loading" class="loading">Loading…</div>

    <ng-container *ngIf="!loading">
      <div class="panel">
        <h2>Working Hours</h2>
        <table class="hours-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Working?</th>
              <th>Start</th>
              <th>End</th>
              <th>Slot (min)</th>
              <th>Buffer (min)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of weekRows">
              <td><strong>{{ dayName(row.dayOfWeek) }}</strong></td>
              <td><input type="checkbox" [(ngModel)]="row.isWorkingDay" /></td>
              <td><input class="hours-input" type="time" [(ngModel)]="row.startTimeStr" [disabled]="!row.isWorkingDay" /></td>
              <td><input class="hours-input" type="time" [(ngModel)]="row.endTimeStr" [disabled]="!row.isWorkingDay" /></td>
              <td><input class="num-input" type="number" min="10" max="120" [(ngModel)]="row.slotDurationMinutes" [disabled]="!row.isWorkingDay" /></td>
              <td><input class="num-input" type="number" min="0" max="60" [(ngModel)]="row.bufferMinutes" [disabled]="!row.isWorkingDay" /></td>
              <td><button class="btn-sm" (click)="saveDay(row)" [disabled]="row.saving">{{ row.saving ? 'Saving…' : 'Save' }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h2>Days Off / Leave</h2>
        <div *ngIf="leaves.length === 0" style="color:var(--gray-400);font-size:0.85rem;font-style:italic;text-align:center;padding:12px;">No leaves scheduled.</div>
        <div *ngFor="let l of leaves" class="leave-row">
          <div>
            <strong>{{ formatDate(l.startDate) }} → {{ formatDate(l.endDate) }}</strong>
            <span *ngIf="l.reason" style="color:var(--gray-500);font-size:0.8rem;"> — {{ l.reason }}</span>
          </div>
          <button class="del-btn" (click)="deleteLeave(l.id)">Remove</button>
        </div>
        <div class="add-leave-form">
          <input type="date" [(ngModel)]="newLeave.startDate" />
          <input type="date" [(ngModel)]="newLeave.endDate" />
          <input [(ngModel)]="newLeave.reason" placeholder="Reason (optional)" />
          <button class="btn-sm" [disabled]="!newLeave.startDate || !newLeave.endDate" (click)="addLeave()">Add Leave</button>
        </div>
      </div>
    </ng-container>

    <div class="toast" *ngIf="toast">{{ toast }}</div>
  `
})
export class DoctorScheduleComponent implements OnInit {
  loading = true;
  weekRows: Array<UpsertWorkingHoursDto & { startTimeStr: string; endTimeStr: string; saving?: boolean }> = [];
  leaves: DoctorLeaveDto[] = [];
  newLeave: { startDate: string; endDate: string; reason: string } = { startDate: '', endDate: '', reason: '' };
  toast = '';

  constructor(private api: DoctorApiService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading = true;
    this.api.getWorkingHours().subscribe({
      next: (rows: DoctorWorkingHoursDto[]) => {
        this.weekRows = [];
        for (let day = 0; day <= 6; day++) {
          const existing = rows.find(r => r.dayOfWeek === day);
          if (existing) {
            this.weekRows.push({
              dayOfWeek: day,
              startTime: existing.startTime,
              endTime: existing.endTime,
              startTimeStr: existing.startTime.substring(0, 5),
              endTimeStr: existing.endTime.substring(0, 5),
              slotDurationMinutes: existing.slotDurationMinutes,
              bufferMinutes: existing.bufferMinutes,
              isWorkingDay: existing.isWorkingDay
            });
          } else {
            this.weekRows.push({
              dayOfWeek: day,
              startTime: '08:00:00',
              endTime: '17:00:00',
              startTimeStr: '08:00',
              endTimeStr: '17:00',
              slotDurationMinutes: 30,
              bufferMinutes: 0,
              isWorkingDay: false
            });
          }
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.api.getLeaves().subscribe(l => this.leaves = l);
  }

  dayName(d: number): string { return DAYS[d] ?? `Day ${d}`; }

  saveDay(row: any): void {
    row.saving = true;
    const dto: UpsertWorkingHoursDto = {
      dayOfWeek: row.dayOfWeek,
      startTime: row.startTimeStr + ':00',
      endTime: row.endTimeStr + ':00',
      slotDurationMinutes: row.slotDurationMinutes,
      bufferMinutes: row.bufferMinutes,
      isWorkingDay: row.isWorkingDay
    };
    this.api.upsertWorkingHours(dto).subscribe({
      next: () => { row.saving = false; this.flashToast('Saved'); },
      error: () => { row.saving = false; this.flashToast('Failed to save'); }
    });
  }

  addLeave(): void {
    if (!this.newLeave.startDate || !this.newLeave.endDate) return;
    this.api.addLeave({
      startDate: this.newLeave.startDate,
      endDate: this.newLeave.endDate,
      reason: this.newLeave.reason || undefined
    }).subscribe(created => {
      this.leaves = [created, ...this.leaves];
      this.newLeave = { startDate: '', endDate: '', reason: '' };
    });
  }

  deleteLeave(id: number): void {
    if (!confirm('Remove this leave?')) return;
    this.api.deleteLeave(id).subscribe(() => {
      this.leaves = this.leaves.filter(l => l.id !== id);
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private flashToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 1800);
  }
}
