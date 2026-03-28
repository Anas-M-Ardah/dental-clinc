import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { PortalApiService } from '../../../core/services/portal-api.service';
import { Doctor } from '../../../core/models/doctor.model';
import { Treatment } from '../../../core/models/treatment.model';
import { AvailableSlot } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    :host { display: block; animation: pageEnter 0.35s ease-out; }
    @keyframes pageEnter {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
    }
    .back-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 16px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: #fff; color: var(--gray-600);
      font-size: 0.85rem; cursor: pointer; text-decoration: none;
      transition: all var(--transition-fast); font-family: inherit;
    }
    .back-btn:hover {
      background: var(--gray-50); border-color: var(--gray-300);
      color: var(--gray-800);
    }
    .page-title {
      font-size: 1.25rem; font-weight: 700; color: var(--gray-900);
      margin: 0; letter-spacing: -0.025em;
    }

    /* Steps */
    .steps { display: flex; gap: 0; margin-bottom: 32px; }
    .step {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; gap: 8px; position: relative;
    }
    .step:not(:last-child)::after {
      content: ''; position: absolute; top: 18px; left: 60%;
      width: 80%; height: 2px;
      background: var(--gray-200); z-index: 0;
      transition: background var(--transition);
    }
    .step.active:not(:last-child)::after { background: var(--primary); }
    .step-circle {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--gray-200); color: var(--gray-400);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.85rem; z-index: 1;
      transition: all var(--transition);
    }
    .step.active .step-circle {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-500) 100%);
      color: #fff;
      box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.25);
    }
    .step.done .step-circle {
      background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
      color: #fff;
    }
    .step-label { font-size: 0.75rem; color: var(--gray-500); font-weight: 500; }
    .step.active .step-label { color: var(--primary); font-weight: 600; }

    /* Card */
    .card {
      background: #fff; border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xs);
      padding: 28px; margin-bottom: 20px;
    }
    .section-title {
      font-size: 0.95rem; font-weight: 600; color: var(--gray-800);
      margin: 0 0 20px;
    }

    /* Doctor Cards */
    .doctor-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .doctor-card {
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 18px;
      cursor: pointer; transition: all var(--transition-fast);
    }
    .doctor-card:hover {
      border-color: var(--primary-200);
      background: var(--primary-light);
    }
    .doctor-card.selected {
      border-color: var(--primary);
      background: var(--primary-light);
      box-shadow: var(--shadow-primary);
    }
    .doctor-name {
      font-weight: 600; color: var(--gray-800);
      font-size: 0.9rem; margin-bottom: 4px;
    }
    .doctor-spec { font-size: 0.8rem; color: var(--gray-500); }

    /* Treatment Cards */
    .treatment-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 14px;
    }
    .treatment-card {
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 16px;
      cursor: pointer; transition: all var(--transition-fast);
    }
    .treatment-card:hover {
      border-color: var(--primary-200);
      background: var(--primary-light);
    }
    .treatment-card.selected {
      border-color: var(--primary);
      background: var(--primary-light);
      box-shadow: var(--shadow-primary);
    }
    .treatment-name {
      font-weight: 600; color: var(--gray-800);
      font-size: 0.85rem; margin-bottom: 4px;
    }
    .treatment-meta { font-size: 0.75rem; color: var(--gray-500); }

    /* Form Controls */
    .form-group { margin-bottom: 18px; }
    .form-label {
      display: block; font-size: 0.82rem; font-weight: 500;
      color: var(--gray-700); margin-bottom: 7px;
    }
    .form-control {
      width: 100%; padding: 11px 14px;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 0.85rem; color: var(--gray-800);
      box-sizing: border-box;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      outline: none; font-family: inherit;
    }
    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    textarea.form-control { resize: vertical; min-height: 80px; }

    /* Slot Buttons */
    .slots-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px; margin-top: 12px;
    }
    .slot-btn {
      padding: 9px; border: 1.5px solid var(--border-color);
      border-radius: var(--radius-full); background: #fff;
      font-size: 0.8rem; cursor: pointer;
      transition: all var(--transition-fast); text-align: center;
      font-variant-numeric: tabular-nums; font-family: inherit;
      color: var(--gray-600);
    }
    .slot-btn:hover {
      border-color: var(--primary-200); color: var(--primary);
      background: var(--primary-light);
    }
    .slot-btn.selected {
      background: var(--primary); color: white;
      border-color: var(--primary);
      box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.25);
      font-weight: 600;
    }
    .no-slots {
      color: var(--gray-400); font-size: 0.85rem; margin-top: 8px;
    }

    /* Action Buttons */
    .actions {
      display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;
    }
    .btn-next {
      padding: 10px 24px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-500) 100%);
      color: #fff; border: none; border-radius: var(--radius-md);
      cursor: pointer; font-size: 0.85rem; font-weight: 600;
      font-family: inherit;
      transition: all var(--transition-fast);
      box-shadow: 0 1px 3px rgba(var(--primary-rgb), 0.2);
    }
    .btn-next:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      transform: translateY(-1px);
      box-shadow: var(--shadow-primary);
    }
    .btn-next:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-back {
      padding: 10px 24px;
      border: 1px solid var(--border-color);
      background: #fff; border-radius: var(--radius-md);
      cursor: pointer; font-size: 0.85rem; color: var(--gray-600);
      font-family: inherit; font-weight: 500;
      transition: all var(--transition-fast);
    }
    .btn-back:hover { background: var(--gray-50); border-color: var(--gray-300); }
    .error-msg {
      color: var(--danger); font-size: 0.8rem; margin-top: 10px;
      padding: 10px; background: var(--danger-light);
      border-radius: var(--radius-sm);
    }
  `],
  template: `
    <div class="page-header">
      <a routerLink="/portal/appointments" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </a>
      <h1 class="page-title">Book Appointment</h1>
    </div>

    <!-- Steps -->
    <div class="steps">
      <div class="step" [class.active]="currentStep >= 1" [class.done]="currentStep > 1">
        <div class="step-circle">
          <ng-container *ngIf="currentStep > 1; else step1Num">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </ng-container>
          <ng-template #step1Num>1</ng-template>
        </div>
        <span class="step-label">Doctor</span>
      </div>
      <div class="step" [class.active]="currentStep >= 2" [class.done]="currentStep > 2">
        <div class="step-circle">
          <ng-container *ngIf="currentStep > 2; else step2Num">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </ng-container>
          <ng-template #step2Num>2</ng-template>
        </div>
        <span class="step-label">Treatment</span>
      </div>
      <div class="step" [class.active]="currentStep >= 3">
        <div class="step-circle">3</div>
        <span class="step-label">Date & Time</span>
      </div>
    </div>

    <!-- Step 1: Pick Doctor -->
    <div class="card" *ngIf="currentStep === 1">
      <h2 class="section-title">Select a Doctor</h2>
      <div class="doctor-grid">
        <div class="doctor-card"
          *ngFor="let doc of doctors"
          [class.selected]="selectedDoctor?.id === doc.id"
          (click)="selectDoctor(doc)">
          <div class="doctor-name">Dr. {{ doc.firstName }} {{ doc.lastName }}</div>
          <div class="doctor-spec">{{ doc.specialization }}</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn-next" [disabled]="!selectedDoctor" (click)="currentStep = 2">Next</button>
      </div>
    </div>

    <!-- Step 2: Pick Treatment -->
    <div class="card" *ngIf="currentStep === 2">
      <h2 class="section-title">Select a Treatment</h2>
      <div class="treatment-grid">
        <div class="treatment-card"
          *ngFor="let t of treatments"
          [class.selected]="selectedTreatment?.id === t.id"
          (click)="selectedTreatment = t">
          <div class="treatment-name">{{ t.name }}</div>
          <div class="treatment-meta">{{ t.durationMinutes }} min &middot; JOD {{ t.price }}</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn-back" (click)="currentStep = 1">Back</button>
        <button class="btn-next" [disabled]="!selectedTreatment" (click)="currentStep = 3">Next</button>
      </div>
    </div>

    <!-- Step 3: Pick Date & Slot -->
    <div class="card" *ngIf="currentStep === 3">
      <h2 class="section-title">Select Date & Time</h2>
      <div class="form-group">
        <label class="form-label">Appointment Date</label>
        <input type="date" class="form-control" [(ngModel)]="selectedDate" [min]="minDate" (change)="loadSlots()" />
      </div>

      <ng-container *ngIf="selectedDate">
        <label class="form-label">Available Slots</label>
        <div *ngIf="slots.length === 0 && slotsLoaded" class="no-slots">
          No slots available for this date.
        </div>
        <div class="slots-grid" *ngIf="slots.length > 0">
          <button class="slot-btn"
            *ngFor="let slot of slots"
            [class.selected]="selectedSlot?.startTime === slot.startTime"
            (click)="selectedSlot = slot">
            {{ slot.startTime }}
          </button>
        </div>
      </ng-container>

      <div class="form-group" style="margin-top:20px;">
        <label class="form-label">Notes (optional)</label>
        <textarea class="form-control" [(ngModel)]="notes" placeholder="Any additional information..."></textarea>
      </div>

      <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

      <div class="actions">
        <button class="btn-back" (click)="currentStep = 2">Back</button>
        <button class="btn-next" [disabled]="!selectedSlot || submitting" (click)="submit()">
          {{ submitting ? 'Booking...' : 'Confirm Booking' }}
        </button>
      </div>
    </div>
  `
})
export class BookAppointmentComponent implements OnInit {
  currentStep = 1;
  doctors: Doctor[] = [];
  treatments: Treatment[] = [];
  slots: AvailableSlot[] = [];
  slotsLoaded = false;

  selectedDoctor: Doctor | null = null;
  selectedTreatment: Treatment | null = null;
  selectedSlot: AvailableSlot | null = null;
  selectedDate = '';
  notes = '';

  submitting = false;
  errorMsg = '';

  minDate = new Date().toISOString().split('T')[0];

  constructor(
    private api: ApiService,
    private portalApi: PortalApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api.getDoctors().subscribe({ next: docs => { this.doctors = docs; } });
    this.api.getTreatments().subscribe({ next: ts => { this.treatments = ts.filter(t => t.isActive); } });
  }

  selectDoctor(doc: Doctor): void {
    this.selectedDoctor = doc;
    this.selectedSlot = null;
    this.slots = [];
    this.slotsLoaded = false;
  }

  loadSlots(): void {
    if (!this.selectedDoctor || !this.selectedDate) return;
    this.slots = [];
    this.slotsLoaded = false;
    this.selectedSlot = null;
    this.api.getAvailableSlots(this.selectedDoctor.id, this.selectedDate).subscribe({
      next: res => {
        this.slots = res.availableSlots;
        this.slotsLoaded = true;
      }
    });
  }

  submit(): void {
    if (!this.selectedDoctor || !this.selectedTreatment || !this.selectedSlot) return;
    this.submitting = true;
    this.errorMsg = '';

    this.portalApi.bookAppointment({
      doctorId: this.selectedDoctor.id,
      treatmentId: this.selectedTreatment.id,
      appointmentDate: this.selectedDate,
      startTime: this.selectedSlot.startTime,
      notes: this.notes || undefined
    }).subscribe({
      next: () => this.router.navigate(['/portal/appointments']),
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'Failed to book appointment. Please try again.';
        this.submitting = false;
      }
    });
  }
}
