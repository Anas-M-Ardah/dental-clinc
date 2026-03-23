import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Doctor } from '../../core/models/doctor.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
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
      </div>
    </div>

    <div class="empty-state" *ngIf="!loading && !doctors.length">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="color: var(--gray-300);">
        <path d="M20 21v-2a4 4 0 0 0-4-4h-1"/>
        <circle cx="15" cy="7" r="4"/>
        <path d="M8 11v4"/>
        <path d="M6 13h4"/>
      </svg>
      <p>{{ 'doctors.noDoctors' | translate }}</p>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }
    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
    }
    .doctors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .doctor-card {
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-xs);
      transition: all 250ms ease;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .doctor-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .doctor-avatar {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-50) 100%);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .doctor-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .doctor-name {
      font-size: 1rem;
      font-weight: 700;
      margin: 0;
      color: var(--gray-900);
    }
    .doctor-spec {
      font-size: 0.82rem;
      color: var(--primary);
      font-weight: 500;
    }
    .doctor-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.82rem;
      color: var(--gray-500);
    }
    .detail-row svg {
      color: var(--gray-400);
      flex-shrink: 0;
    }
    .doctor-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .status-dot.available {
      background: var(--success);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }
    .status-dot.unavailable {
      background: var(--danger);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 24px;
      gap: 12px;
    }
    .empty-state p {
      color: var(--gray-400);
      font-weight: 500;
      margin: 0;
    }
  `]
})
export class DoctorsComponent implements OnInit, OnDestroy {
  doctors: Doctor[] = [];
  loading = false;
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
}
