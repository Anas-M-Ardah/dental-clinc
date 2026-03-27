import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService, DashboardStats, TodaySchedule } from '../../core/services/api.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="dashboard-header">
      <div>
        <h2 class="dashboard-title">{{ 'dashboard.title' | translate }}</h2>
        <p class="dashboard-subtitle">{{ currentLang === 'en' ? 'Welcome back! Here\\'s your clinic overview.' : 'مرحباً بعودتك! إليك نظرة عامة على العيادة.' }}</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ 'dashboard.todaysAppointments' | translate }}</div>
          <div class="stat-value">{{ stats?.todayAppointments || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ 'dashboard.totalPatients' | translate }}</div>
          <div class="stat-value">{{ stats?.totalPatients || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ 'dashboard.monthlyRevenue' | translate }}</div>
          <div class="stat-value">\${{ stats?.monthlyRevenue || 0 | number:'1.0-0' }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ 'dashboard.pendingInvoices' | translate }}</div>
          <div class="stat-value">{{ stats?.pendingInvoices || 0 }}</div>
        </div>
      </div>
    </div>

    <!-- Today's Schedule & Quick Actions -->
    <div class="row" style="margin-top: 8px;">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">{{ 'dashboard.todaysSchedule' | translate }}</h5>
            <a routerLink="/appointments" class="btn btn-sm btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
              {{ 'dashboard.viewAll' | translate }}
            </a>
          </div>
          <div class="card-body" style="padding: 0;">
            <div *ngIf="loading" class="text-center py-4 text-muted">
              {{ 'common.loading' | translate }}
            </div>
            <div class="table-responsive" *ngIf="!loading && todaySchedule?.appointments?.length">
              <table class="table mb-0">
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
                  <tr *ngFor="let apt of todaySchedule?.appointments; trackBy: trackById">
                    <td>
                      <span class="time-badge">{{ apt.startTime }}</span>
                    </td>
                    <td><strong>{{ apt.patientName }}</strong></td>
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
            </div>
            <div class="empty-state" *ngIf="!loading && !todaySchedule?.appointments?.length">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gray-300);">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p>{{ 'dashboard.noAppointmentsToday' | translate }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0">{{ 'dashboard.quickActions' | translate }}</h5>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <a routerLink="/patients/new" class="quick-action-btn">
                <div class="quick-action-icon primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                </div>
                <span>{{ 'dashboard.newPatient' | translate }}</span>
              </a>
              <a routerLink="/appointments/new" class="quick-action-btn">
                <div class="quick-action-icon success">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="12" y1="14" x2="12" y2="18"/>
                    <line x1="10" y1="16" x2="14" y2="16"/>
                  </svg>
                </div>
                <span>{{ 'dashboard.newAppointment' | translate }}</span>
              </a>
              <a routerLink="/invoices" class="quick-action-btn">
                <div class="quick-action-icon warning">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <span>{{ 'dashboard.viewInvoices' | translate }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      margin-bottom: 28px;
    }
    .dashboard-title {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 4px;
    }
    .dashboard-subtitle {
      color: var(--gray-500);
      font-size: 0.9rem;
      margin: 0;
    }
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
    .table-responsive {
      overflow-x: auto;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      gap: 12px;
    }
    .empty-state p {
      color: var(--gray-400);
      font-weight: 500;
      margin: 0;
    }
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      border: 1.5px solid var(--border-color);
      background: #fff;
      transition: all 200ms ease;
      font-weight: 500;
      font-size: 0.88rem;
      color: var(--gray-700);
      cursor: pointer;
    }
    .quick-action-btn:hover {
      border-color: var(--primary-200);
      background: var(--primary-light);
      color: var(--primary);
      transform: translateX(4px);
      box-shadow: var(--shadow-sm);
    }
    :host-context(.rtl) .quick-action-btn:hover {
      transform: translateX(-4px);
    }
    .quick-action-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .quick-action-icon.primary {
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-50) 100%);
      color: var(--primary);
    }
    .quick-action-icon.success {
      background: linear-gradient(135deg, var(--success-light) 0%, #d1fae5 100%);
      color: var(--success);
    }
    .quick-action-icon.warning {
      background: linear-gradient(135deg, var(--warning-light) 0%, #fef3c7 100%);
      color: var(--warning-dark);
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  todaySchedule: TodaySchedule | null = null;
  loading = true;
  currentLang = 'en';
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private translation: TranslationService
  ) {
    this.currentLang = this.translation.currentLanguage;
  }

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.loading = true;
    this.api.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.stats = data,
        error: () => this.stats = null
      });
    this.api.getTodaySchedule()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.todaySchedule = data; this.loading = false; },
        error: () => this.loading = false
      });
  }

  trackById(index: number, item: any): number {
    return item.id;
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
}
