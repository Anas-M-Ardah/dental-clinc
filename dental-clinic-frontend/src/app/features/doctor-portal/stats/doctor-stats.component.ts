import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { DoctorPerformanceDto } from '../../../core/models/doctor-auth.model';

@Component({
  selector: 'app-doctor-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 4px; }
    .page-sub { font-size: 0.9rem; color: var(--gray-500); margin-bottom: 24px; }
    .filter-bar {
      display: flex; gap: 12px; align-items: end; padding: 16px 18px;
      background: #fff; border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); margin-bottom: 18px;
    }
    .filter-field { display: flex; flex-direction: column; gap: 4px; }
    .filter-field label { font-size: 0.74rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
    .filter-field input { padding: 8px 12px; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); font-family: inherit; font-size: 0.85rem; }
    .filter-bar button {
      padding: 9px 18px; background: #0284c7; color: #fff; border: none;
      border-radius: var(--radius-md); font-weight: 600; font-size: 0.85rem;
      cursor: pointer; font-family: inherit;
    }
    .filter-bar button:hover { background: #0369a1; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .stat-card {
      background: #fff; border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 20px;
    }
    .stat-label { font-size: 0.74rem; font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 1px; }
    .stat-value { font-size: 1.8rem; font-weight: 700; color: var(--gray-900); margin-top: 8px; letter-spacing: -0.025em; }
    .stat-icon { width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
    .stat-icon.green { background: #dcfce7; color: #16a34a; }
    .stat-icon.amber { background: #fef3c7; color: #d97706; }
    .stat-icon.red { background: #fee2e2; color: #b91c1c; }
    .stat-icon.blue { background: #e0f2fe; color: #0284c7; }
    .stat-icon.indigo { background: #ede9fe; color: #7c3aed; }
    .loading { padding: 28px; text-align: center; color: var(--gray-400); }
  `],
  template: `
    <h1 class="page-title">My Performance</h1>
    <p class="page-sub">Your clinical and revenue metrics for the selected date range.</p>

    <div class="filter-bar">
      <div class="filter-field">
        <label>From</label>
        <input type="date" [(ngModel)]="startDate" />
      </div>
      <div class="filter-field">
        <label>To</label>
        <input type="date" [(ngModel)]="endDate" />
      </div>
      <button (click)="load()">Apply</button>
    </div>

    <div *ngIf="loading" class="loading">Loading…</div>

    <div *ngIf="!loading && stats" class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon green">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="stat-label">Appointments Completed</div>
        <div class="stat-value">{{ stats.appointmentsCompleted }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <div class="stat-label">Cancellations</div>
        <div class="stat-value">{{ stats.appointmentsCancelled }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <div class="stat-label">No-Shows</div>
        <div class="stat-value">{{ stats.noShows }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-label">Revenue Generated</div>
        <div class="stat-value">{{ stats.revenue | number: '1.0-2' }} JOD</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon indigo">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"/><polyline points="18 7 13 12 9 8 3 14"/>
          </svg>
        </div>
        <div class="stat-label">Completion Rate</div>
        <div class="stat-value">{{ stats.completionRate | number: '1.0-1' }}%</div>
      </div>
    </div>
  `
})
export class DoctorStatsComponent implements OnInit {
  stats: DoctorPerformanceDto | null = null;
  loading = false;
  startDate: string;
  endDate: string;

  constructor(private api: DoctorApiService) {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(today.getMonth() - 1);
    this.startDate = monthAgo.toISOString().slice(0, 10);
    this.endDate = today.toISOString().slice(0, 10);
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getStats(this.startDate, this.endDate).subscribe({
      next: s => { this.stats = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
