import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalApiService } from '../../../core/services/portal-api.service';

@Component({
  selector: 'app-portal-treatment-plan',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host { display: block; animation: pageEnter 0.35s ease-out; }
    @keyframes pageEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .page-title { font-size: 1.25rem; font-weight: 700; color: var(--gray-900); margin: 0 0 24px; letter-spacing: -0.025em; }

    .timeline { position: relative; padding-left: 32px; }
    .timeline::before {
      content: ''; position: absolute; left: 15px; top: 0; bottom: 0;
      width: 2px; background: var(--gray-200);
    }

    .timeline-item { position: relative; margin-bottom: 24px; }
    .timeline-dot {
      position: absolute; left: -25px; top: 4px;
      width: 12px; height: 12px; border-radius: 50%;
      border: 2px solid var(--gray-300); background: #fff;
    }
    .timeline-dot.completed { background: var(--success, #22c55e); border-color: var(--success, #22c55e); }
    .timeline-dot.upcoming { background: var(--primary); border-color: var(--primary); }
    .timeline-dot.planned { background: #fff; border-color: var(--gray-300); }

    .plan-card {
      background: #fff; border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 18px 22px;
      box-shadow: var(--shadow-xs); transition: all 0.2s;
    }
    .plan-card:hover { box-shadow: var(--shadow-sm); }
    .plan-card.upcoming { border-left: 3px solid var(--primary); }
    .plan-card.completed { opacity: 0.8; }

    .plan-date { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--gray-400); margin-bottom: 6px; }
    .plan-title { font-weight: 700; font-size: 0.95rem; color: var(--gray-900); margin-bottom: 4px; }
    .plan-doctor { font-size: 0.82rem; color: var(--gray-500); }
    .plan-details { margin-top: 10px; }
    .plan-detail { font-size: 0.82rem; color: var(--gray-600); line-height: 1.5; }
    .plan-detail-label { font-weight: 600; color: var(--gray-700); }

    .status-badge {
      display: inline-block; padding: 2px 10px; border-radius: var(--radius-full);
      font-size: 0.7rem; font-weight: 700; margin-left: 8px;
    }
    .status-completed { background: #d1fae5; color: #059669; }
    .status-upcoming { background: #dbeafe; color: #2563eb; }
    .status-planned { background: var(--gray-100); color: var(--gray-500); }

    .cost-estimate {
      display: inline-block; font-size: 0.82rem; font-weight: 700;
      color: var(--gray-900); margin-top: 8px;
      padding: 4px 10px; background: var(--gray-50); border-radius: var(--radius-md);
    }

    .empty-state { text-align: center; padding: 48px; color: var(--gray-400); font-size: 0.85rem; }
    .empty-icon { display: flex; justify-content: center; margin-bottom: 12px; color: var(--gray-300); }
  `],
  template: `
    <h1 class="page-title">Treatment Plan</h1>

    <div *ngIf="records.length > 0; else emptyState">
      <div class="timeline">
        <div class="timeline-item" *ngFor="let rec of records">
          <div class="timeline-dot" [ngClass]="getStatusClass(rec)"></div>
          <div class="plan-card" [ngClass]="getStatusClass(rec)">
            <div class="plan-date">
              {{ rec.visitDate | date:'mediumDate' }}
              <span class="status-badge" [ngClass]="'status-' + getStatusClass(rec)">{{ getStatusLabel(rec) }}</span>
            </div>
            <div class="plan-title">
              {{ rec.primaryDiagnosis || rec.chiefComplaint || 'Visit' }}
            </div>
            <div class="plan-doctor">Dr. {{ rec.doctorName }}</div>

            <div class="plan-details" *ngIf="rec.treatmentPlan || rec.treatmentStages || rec.procedurePerformed">
              <div class="plan-detail" *ngIf="rec.treatmentPlan">
                <span class="plan-detail-label">Plan: </span>{{ rec.treatmentPlan }}
              </div>
              <div class="plan-detail" *ngIf="rec.treatmentStages">
                <span class="plan-detail-label">Stages: </span>{{ rec.treatmentStages }}
              </div>
              <div class="plan-detail" *ngIf="rec.procedurePerformed">
                <span class="plan-detail-label">Procedure: </span>{{ rec.procedurePerformed }}
              </div>
              <div class="plan-detail" *ngIf="rec.postTreatmentInstructions">
                <span class="plan-detail-label">Instructions: </span>{{ rec.postTreatmentInstructions }}
              </div>
            </div>

            <div class="cost-estimate" *ngIf="rec.estimatedCost > 0">
              Est. JOD {{ rec.estimatedCost | number:'1.2-2' }}
            </div>

            <div class="plan-details" *ngIf="rec.nextAppointmentDate">
              <div class="plan-detail">
                <span class="plan-detail-label">Next appointment: </span>{{ rec.nextAppointmentDate | date:'mediumDate' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #emptyState>
      <div class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        No treatment plans found.
      </div>
    </ng-template>
  `
})
export class PortalTreatmentPlanComponent implements OnInit {
  records: any[] = [];
  private now = new Date();

  constructor(private portalApi: PortalApiService) {}

  ngOnInit(): void {
    this.portalApi.getTreatmentHistory().subscribe({
      next: recs => {
        this.records = recs
          .filter((r: any) => r.treatmentPlan || r.treatmentStages || r.nextAppointmentDate)
          .sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
      }
    });
  }

  getStatusClass(rec: any): string {
    const visitDate = new Date(rec.visitDate);
    if (rec.nextAppointmentDate && new Date(rec.nextAppointmentDate) > this.now) return 'upcoming';
    if (visitDate <= this.now) return 'completed';
    return 'planned';
  }

  getStatusLabel(rec: any): string {
    const visitDate = new Date(rec.visitDate);
    if (rec.nextAppointmentDate && new Date(rec.nextAppointmentDate) > this.now) return 'Upcoming';
    if (visitDate <= this.now) return 'Completed';
    return 'Planned';
  }
}
