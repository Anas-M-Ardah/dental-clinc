import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalApiService } from '../../../core/services/portal-api.service';
import { TreatmentRecord } from '../../../core/models/treatment-record.model';

@Component({
  selector: 'app-portal-treatment-history',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host { display: block; animation: pageEnter 0.35s ease-out; }
    @keyframes pageEnter {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-title {
      font-size: 1.25rem; font-weight: 700; color: var(--gray-900);
      margin: 0 0 24px; letter-spacing: -0.025em;
    }

    .record-card {
      background: #fff; border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xs);
      margin-bottom: 12px; overflow: hidden;
      transition: box-shadow var(--transition);
    }
    .record-card:hover { box-shadow: var(--shadow-sm); }

    .record-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; cursor: pointer;
      transition: background var(--transition-fast);
    }
    .record-header:hover { background: var(--gray-50); }
    .record-date { font-weight: 600; color: var(--gray-800); font-size: 0.9rem; }
    .record-doctor { font-size: 0.8rem; color: var(--gray-500); margin-top: 2px; }
    .expand-icon {
      color: var(--gray-400); transition: transform var(--transition-fast);
      display: flex; align-items: center;
    }
    .expand-icon.open { transform: rotate(180deg); }

    .record-body {
      padding: 0 20px 20px;
      border-top: 1px solid var(--gray-100);
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px; margin-top: 18px;
    }
    .detail-label {
      font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.6px; color: var(--gray-400); margin-bottom: 6px;
    }
    .detail-value { font-size: 0.85rem; color: var(--gray-700); line-height: 1.6; }

    .empty-state {
      text-align: center; padding: 48px; color: var(--gray-400);
      font-size: 0.85rem;
    }
    .empty-icon {
      display: flex; justify-content: center; margin-bottom: 12px;
      color: var(--gray-300);
    }
  `],
  template: `
    <h1 class="page-title">Treatment History</h1>

    <ng-container *ngIf="records.length > 0; else emptyState">
      <div class="record-card" *ngFor="let rec of records">
        <div class="record-header" (click)="toggle(rec.id)">
          <div>
            <div class="record-date">{{ rec.visitDate | date:'longDate' }}</div>
            <div class="record-doctor">Dr. {{ rec.doctorName }}</div>
          </div>
          <span class="expand-icon" [class.open]="expanded.has(rec.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
        </div>

        <div class="record-body" *ngIf="expanded.has(rec.id)">
          <div class="detail-grid">
            <div *ngIf="rec.chiefComplaint">
              <div class="detail-label">Chief Complaint</div>
              <div class="detail-value">{{ rec.chiefComplaint }}</div>
            </div>
            <div *ngIf="rec.primaryDiagnosis">
              <div class="detail-label">Diagnosis</div>
              <div class="detail-value">{{ rec.primaryDiagnosis }}</div>
            </div>
            <div *ngIf="rec.procedurePerformed">
              <div class="detail-label">Procedure Performed</div>
              <div class="detail-value">{{ rec.procedurePerformed }}</div>
            </div>
            <div *ngIf="rec.prescriptions">
              <div class="detail-label">Prescriptions</div>
              <div class="detail-value">{{ rec.prescriptions }}</div>
            </div>
            <div *ngIf="rec.postTreatmentInstructions">
              <div class="detail-label">Post-Treatment Instructions</div>
              <div class="detail-value">{{ rec.postTreatmentInstructions }}</div>
            </div>
            <div *ngIf="rec.nextAppointmentDate">
              <div class="detail-label">Next Appointment</div>
              <div class="detail-value">{{ rec.nextAppointmentDate | date:'mediumDate' }}</div>
            </div>
            <div *ngIf="rec.notes">
              <div class="detail-label">Notes</div>
              <div class="detail-value">{{ rec.notes }}</div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #emptyState>
      <div class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        No treatment records found.
      </div>
    </ng-template>
  `
})
export class PortalTreatmentHistoryComponent implements OnInit {
  records: TreatmentRecord[] = [];
  expanded = new Set<number>();

  constructor(private portalApi: PortalApiService) {}

  ngOnInit(): void {
    this.portalApi.getTreatmentHistory().subscribe({
      next: recs => { this.records = recs; }
    });
  }

  toggle(id: number): void {
    if (this.expanded.has(id)) {
      this.expanded.delete(id);
    } else {
      this.expanded.add(id);
    }
  }
}
