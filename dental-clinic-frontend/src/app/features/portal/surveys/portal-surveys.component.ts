import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalApiService } from '../../../core/services/portal-api.service';

@Component({
  selector: 'app-portal-surveys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host { display: block; animation: pageEnter 0.35s ease-out; }
    @keyframes pageEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .page-title { font-size: 1.25rem; font-weight: 700; color: var(--gray-900); margin: 0 0 24px; letter-spacing: -0.025em; }

    .section-title { font-size: 1rem; font-weight: 700; color: var(--gray-900); margin: 0 0 14px; }

    .pending-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
    .pending-card {
      background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg);
      padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
      box-shadow: var(--shadow-xs); transition: all 0.2s;
    }
    .pending-card:hover { border-color: var(--primary-200, #c7d2fe); }
    .pending-info { }
    .pending-doctor { font-weight: 700; font-size: 0.9rem; color: var(--gray-900); }
    .pending-meta { font-size: 0.78rem; color: var(--gray-400); margin-top: 2px; }
    .btn-rate {
      padding: 8px 18px; background: var(--primary); color: #fff; border: none;
      border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-rate:hover { opacity: 0.9; transform: translateY(-1px); }

    /* Survey Form Modal */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 2000; animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    .modal-content {
      background: #fff; border-radius: 12px; width: 480px; max-width: 90vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: slideUp 0.2s ease;
    }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--border-color);
    }
    .modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: var(--gray-400); cursor: pointer; }
    .modal-body { padding: 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 8px; }

    .rating-group { margin-bottom: 20px; }
    .rating-label { font-size: 0.82rem; font-weight: 600; color: var(--gray-700); margin-bottom: 8px; }
    .stars { display: flex; gap: 6px; }
    .star {
      width: 32px; height: 32px; cursor: pointer; color: var(--gray-200);
      transition: all 0.15s;
    }
    .star.filled { color: #f59e0b; }
    .star:hover { transform: scale(1.15); }

    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
    textarea.form-control { resize: vertical; min-height: 80px; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .toggle-label { font-size: 0.85rem; color: var(--gray-700); font-weight: 500; }
    .toggle-switch { position: relative; width: 44px; height: 24px; cursor: pointer; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: var(--gray-300); border-radius: 24px; transition: background 0.2s;
    }
    .toggle-slider::before {
      content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px;
      background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .toggle-switch input:checked + .toggle-slider { background: var(--primary); }
    .toggle-switch input:checked + .toggle-slider::before { transform: translateX(20px); }

    /* Past Surveys */
    .survey-card {
      background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg);
      padding: 20px; box-shadow: var(--shadow-xs); margin-bottom: 10px;
    }
    .survey-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .survey-doctor { font-weight: 700; font-size: 0.9rem; }
    .survey-date { font-size: 0.78rem; color: var(--gray-400); }
    .ratings-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
    .rating-item { font-size: 0.8rem; color: var(--gray-600); }
    .rating-item strong { color: var(--gray-900); }
    .star-display { color: #f59e0b; font-size: 0.85rem; letter-spacing: 2px; }
    .survey-comment { font-size: 0.82rem; color: var(--gray-500); margin-top: 8px; line-height: 1.5; }
    .recommend-badge {
      display: inline-block; padding: 2px 10px; border-radius: var(--radius-full);
      font-size: 0.72rem; font-weight: 700;
    }
    .recommend-yes { background: #d1fae5; color: #059669; }
    .recommend-no { background: #fee2e2; color: #dc2626; }

    .empty-state { text-align: center; padding: 40px; color: var(--gray-300); font-size: 0.85rem; }
  `],
  template: `
    <h1 class="page-title">Feedback & Surveys</h1>

    <!-- Pending surveys -->
    <div *ngIf="pendingAppointments.length > 0">
      <h3 class="section-title">Rate Your Recent Visits</h3>
      <div class="pending-list">
        <div class="pending-card" *ngFor="let appt of pendingAppointments">
          <div class="pending-info">
            <div class="pending-doctor">Dr. {{ appt.doctorName }}</div>
            <div class="pending-meta">{{ appt.appointmentDate | date:'mediumDate' }} &middot; {{ appt.treatmentName }}</div>
          </div>
          <button class="btn-rate" (click)="openSurvey(appt)">Rate Visit</button>
        </div>
      </div>
    </div>

    <!-- Past surveys -->
    <h3 class="section-title">Your Feedback</h3>
    <div *ngIf="surveys.length > 0; else noSurveys">
      <div class="survey-card" *ngFor="let s of surveys">
        <div class="survey-top">
          <div>
            <span class="survey-doctor">Dr. {{ s.doctorName }}</span>
            <span class="survey-date"> &middot; {{ s.appointmentDate | date:'mediumDate' }}</span>
          </div>
          <span class="recommend-badge" [ngClass]="s.wouldRecommend ? 'recommend-yes' : 'recommend-no'">
            {{ s.wouldRecommend ? 'Would Recommend' : 'Would Not Recommend' }}
          </span>
        </div>
        <div class="ratings-row">
          <div class="rating-item"><strong>Overall:</strong> <span class="star-display">{{ getStars(s.overallRating) }}</span></div>
          <div class="rating-item" *ngIf="s.staffRating"><strong>Staff:</strong> <span class="star-display">{{ getStars(s.staffRating) }}</span></div>
          <div class="rating-item" *ngIf="s.cleanlinessRating"><strong>Cleanliness:</strong> <span class="star-display">{{ getStars(s.cleanlinessRating) }}</span></div>
          <div class="rating-item" *ngIf="s.waitTimeRating"><strong>Wait Time:</strong> <span class="star-display">{{ getStars(s.waitTimeRating) }}</span></div>
        </div>
        <div class="survey-comment" *ngIf="s.comments">{{ s.comments }}</div>
      </div>
    </div>
    <ng-template #noSurveys>
      <div class="empty-state">No feedback submitted yet.</div>
    </ng-template>

    <!-- Survey Modal -->
    <div class="modal-backdrop" *ngIf="showSurveyModal" (click)="closeSurvey()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Rate Your Visit</h3>
          <button class="close-btn" (click)="closeSurvey()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="rating-group">
            <div class="rating-label">Overall Experience *</div>
            <div class="stars">
              <svg *ngFor="let i of [1,2,3,4,5]" class="star" [class.filled]="i <= surveyForm.overallRating"
                (click)="surveyForm.overallRating = i" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <div class="rating-group">
            <div class="rating-label">Staff Friendliness</div>
            <div class="stars">
              <svg *ngFor="let i of [1,2,3,4,5]" class="star" [class.filled]="i <= (surveyForm.staffRating || 0)"
                (click)="surveyForm.staffRating = i" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <div class="rating-group">
            <div class="rating-label">Cleanliness</div>
            <div class="stars">
              <svg *ngFor="let i of [1,2,3,4,5]" class="star" [class.filled]="i <= (surveyForm.cleanlinessRating || 0)"
                (click)="surveyForm.cleanlinessRating = i" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <div class="rating-group">
            <div class="rating-label">Wait Time</div>
            <div class="stars">
              <svg *ngFor="let i of [1,2,3,4,5]" class="star" [class.filled]="i <= (surveyForm.waitTimeRating || 0)"
                (click)="surveyForm.waitTimeRating = i" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <div class="toggle-row">
            <span class="toggle-label">Would you recommend us?</span>
            <label class="toggle-switch">
              <input type="checkbox" [(ngModel)]="surveyForm.wouldRecommend">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="form-group">
            <label>Comments (optional)</label>
            <textarea class="form-control" [(ngModel)]="surveyForm.comments" maxlength="1000" placeholder="Share your experience..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeSurvey()">Cancel</button>
          <button class="btn-rate" (click)="submitSurvey()" [disabled]="submitting || surveyForm.overallRating === 0">
            {{ submitting ? 'Submitting...' : 'Submit Feedback' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class PortalSurveysComponent implements OnInit {
  pendingAppointments: any[] = [];
  surveys: any[] = [];
  showSurveyModal = false;
  submitting = false;
  selectedAppointment: any = null;
  surveyForm = { overallRating: 0, staffRating: null as number | null, cleanlinessRating: null as number | null, waitTimeRating: null as number | null, wouldRecommend: true, comments: '' };

  constructor(private portalApi: PortalApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.portalApi.getPendingSurveyAppointments().subscribe({ next: a => this.pendingAppointments = a });
    this.portalApi.getMySurveys().subscribe({ next: s => this.surveys = s });
  }

  openSurvey(appt: any) {
    this.selectedAppointment = appt;
    this.surveyForm = { overallRating: 0, staffRating: null, cleanlinessRating: null, waitTimeRating: null, wouldRecommend: true, comments: '' };
    this.showSurveyModal = true;
  }

  closeSurvey() { this.showSurveyModal = false; }

  submitSurvey() {
    if (this.surveyForm.overallRating === 0) return;
    this.submitting = true;
    const dto = {
      appointmentId: this.selectedAppointment.id,
      ...this.surveyForm
    };
    this.portalApi.submitSurvey(dto).subscribe({
      next: () => {
        this.submitting = false;
        this.closeSurvey();
        this.loadData();
      },
      error: () => { this.submitting = false; }
    });
  }

  getStars(rating: number): string {
    return '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);
  }
}
