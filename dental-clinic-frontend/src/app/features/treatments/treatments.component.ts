import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Treatment } from '../../core/models/treatment.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="page-header">
      <h2>{{ 'treatments.title' | translate }}</h2>
    </div>

    <div *ngIf="loading" class="text-center py-4 text-muted">{{ 'common.loading' | translate }}</div>

    <div class="treatments-grid" *ngIf="!loading && treatments.length">
      <div class="treatment-card" *ngFor="let t of treatments; trackBy: trackById">
        <div class="treatment-header">
          <div class="treatment-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
          <h5 class="treatment-name">{{ t.name }}</h5>
        </div>
        <p class="treatment-desc" *ngIf="t.description">{{ t.description }}</p>
        <div class="treatment-meta">
          <div class="meta-item">
            <span class="meta-label">{{ 'common.price' | translate }}</span>
            <span class="meta-value price">\${{ t.price | number:'1.0-0' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ 'treatments.duration' | translate }}</span>
            <span class="meta-value">{{ t.durationMinutes }} {{ 'treatments.minutes' | translate }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="!loading && !treatments.length">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="color: var(--gray-300);">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
      <p>{{ 'treatments.noTreatments' | translate }}</p>
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
    .treatments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .treatment-card {
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-xs);
      transition: all 250ms ease;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .treatment-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .treatment-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .treatment-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
      color: var(--danger);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .treatment-name {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0;
      color: var(--gray-900);
    }
    .treatment-desc {
      font-size: 0.82rem;
      color: var(--gray-500);
      line-height: 1.6;
      margin: 0;
    }
    .treatment-meta {
      display: flex;
      gap: 20px;
      padding-top: 14px;
      border-top: 1px solid var(--border-color);
      margin-top: auto;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .meta-label {
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--gray-400);
    }
    .meta-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--gray-800);
    }
    .meta-value.price {
      color: var(--success-dark);
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
export class TreatmentsComponent implements OnInit, OnDestroy {
  treatments: Treatment[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getTreatments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.treatments = data; this.loading = false; },
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
