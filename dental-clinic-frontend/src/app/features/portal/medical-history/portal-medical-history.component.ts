import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalApiService } from '../../../core/services/portal-api.service';

@Component({
  selector: 'app-portal-medical-history',
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

    .section { margin-bottom: 28px; }
    .section-header {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 14px;
    }
    .section-icon {
      width: 36px; height: 36px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
    }
    .section-icon.allergies { background: #fee2e2; color: #dc2626; }
    .section-icon.medications { background: #dbeafe; color: #2563eb; }
    .section-icon.conditions { background: #fef3c7; color: #d97706; }
    .section-icon.family { background: #ede9fe; color: #7c3aed; }
    .section-icon svg { width: 18px; height: 18px; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--gray-900); }
    .section-count { font-size: 0.75rem; color: var(--gray-400); font-weight: 500; }

    .item-list { display: flex; flex-direction: column; gap: 8px; }
    .item-card {
      background: #fff; border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 16px 20px;
      box-shadow: var(--shadow-xs);
    }
    .item-name { font-weight: 700; font-size: 0.9rem; color: var(--gray-900); }
    .item-meta { font-size: 0.78rem; color: var(--gray-400); margin-top: 4px; display: flex; gap: 12px; flex-wrap: wrap; }
    .item-meta span { display: inline-flex; align-items: center; gap: 4px; }
    .item-notes { font-size: 0.82rem; color: var(--gray-500); margin-top: 6px; }

    .severity-badge {
      display: inline-block; padding: 2px 8px; border-radius: var(--radius-full);
      font-size: 0.7rem; font-weight: 700;
    }
    .severity-mild { background: #d1fae5; color: #059669; }
    .severity-moderate { background: #fef3c7; color: #d97706; }
    .severity-severe { background: #fee2e2; color: #dc2626; }

    .status-badge {
      display: inline-block; padding: 2px 8px; border-radius: var(--radius-full);
      font-size: 0.7rem; font-weight: 700;
    }
    .status-active { background: #d1fae5; color: #059669; }
    .status-inactive { background: var(--gray-100); color: var(--gray-500); }

    .empty-section {
      padding: 24px; text-align: center; color: var(--gray-300);
      font-size: 0.85rem; background: var(--gray-50);
      border-radius: var(--radius-lg); border: 1px dashed var(--border-color);
    }

    .legacy-note {
      background: var(--gray-50); border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 28px;
    }
    .legacy-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--gray-400); margin-bottom: 8px; }
    .legacy-text { font-size: 0.85rem; color: var(--gray-600); line-height: 1.6; white-space: pre-wrap; }
  `],
  template: `
    <h1 class="page-title">Medical History</h1>

    <div class="legacy-note" *ngIf="data?.legacyMedicalHistory">
      <div class="legacy-label">General Medical History</div>
      <div class="legacy-text">{{ data.legacyMedicalHistory }}</div>
    </div>

    <!-- Allergies -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon allergies">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <span class="section-title">Allergies</span>
        <span class="section-count" *ngIf="data?.allergies?.length">{{ data.allergies.length }}</span>
      </div>
      <div class="item-list" *ngIf="data?.allergies?.length; else noAllergies">
        <div class="item-card" *ngFor="let a of data.allergies">
          <div class="item-name">
            {{ a.allergyName }}
            <span class="severity-badge" *ngIf="a.severity"
              [ngClass]="'severity-' + a.severity.toLowerCase()">{{ a.severity }}</span>
          </div>
          <div class="item-notes" *ngIf="a.notes">{{ a.notes }}</div>
        </div>
      </div>
      <ng-template #noAllergies><div class="empty-section">No known allergies recorded</div></ng-template>
    </div>

    <!-- Medications -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon medications">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5"/>
            <rect x="9" y="1" width="6" height="4" rx="1"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
          </svg>
        </div>
        <span class="section-title">Medications</span>
        <span class="section-count" *ngIf="data?.medications?.length">{{ data.medications.length }}</span>
      </div>
      <div class="item-list" *ngIf="data?.medications?.length; else noMedications">
        <div class="item-card" *ngFor="let m of data.medications">
          <div class="item-name">
            {{ m.medicationName }}
            <span class="status-badge" [ngClass]="m.isActive ? 'status-active' : 'status-inactive'">
              {{ m.isActive ? 'Active' : 'Discontinued' }}
            </span>
          </div>
          <div class="item-meta">
            <span *ngIf="m.dosage">Dosage: {{ m.dosage }}</span>
            <span *ngIf="m.frequency">Frequency: {{ m.frequency }}</span>
          </div>
          <div class="item-notes" *ngIf="m.notes">{{ m.notes }}</div>
        </div>
      </div>
      <ng-template #noMedications><div class="empty-section">No medications recorded</div></ng-template>
    </div>

    <!-- Conditions -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon conditions">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <span class="section-title">Medical Conditions</span>
        <span class="section-count" *ngIf="data?.conditions?.length">{{ data.conditions.length }}</span>
      </div>
      <div class="item-list" *ngIf="data?.conditions?.length; else noConditions">
        <div class="item-card" *ngFor="let c of data.conditions">
          <div class="item-name">
            {{ c.conditionName }}
            <span class="status-badge" [ngClass]="c.isActive ? 'status-active' : 'status-inactive'">
              {{ c.isActive ? 'Active' : 'Resolved' }}
            </span>
          </div>
          <div class="item-meta">
            <span *ngIf="c.diagnosedDate">Diagnosed: {{ c.diagnosedDate | date:'mediumDate' }}</span>
          </div>
          <div class="item-notes" *ngIf="c.notes">{{ c.notes }}</div>
        </div>
      </div>
      <ng-template #noConditions><div class="empty-section">No medical conditions recorded</div></ng-template>
    </div>

    <!-- Family History -->
    <div class="section">
      <div class="section-header">
        <div class="section-icon family">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <span class="section-title">Family History</span>
        <span class="section-count" *ngIf="data?.familyHistory?.length">{{ data.familyHistory.length }}</span>
      </div>
      <div class="item-list" *ngIf="data?.familyHistory?.length; else noFamily">
        <div class="item-card" *ngFor="let f of data.familyHistory">
          <div class="item-name">{{ f.conditionName }}</div>
          <div class="item-meta">
            <span>Relationship: {{ f.relationship }}</span>
          </div>
          <div class="item-notes" *ngIf="f.notes">{{ f.notes }}</div>
        </div>
      </div>
      <ng-template #noFamily><div class="empty-section">No family medical history recorded</div></ng-template>
    </div>
  `
})
export class PortalMedicalHistoryComponent implements OnInit {
  data: any = null;

  constructor(private portalApi: PortalApiService) {}

  ngOnInit(): void {
    this.portalApi.getMyMedicalHistory().subscribe({
      next: d => this.data = d
    });
  }
}
