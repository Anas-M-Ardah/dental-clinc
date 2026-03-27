import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Doctor } from '../../core/models/doctor.model';
import { Treatment } from '../../core/models/treatment.model';
import { Patient } from '../../core/models/patient.model';
import { CreateAppointmentDto, AvailableSlot } from '../../core/models/appointment.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header">
      <div class="page-header-back">
        <a routerLink="/appointments" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
        </a>
        <h2>{{ 'appointments.newAppointment' | translate }}</h2>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <form (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="patientId">{{ 'appointments.patient' | translate }} *</label>
              <select class="form-select" id="patientId" [(ngModel)]="appointment.patientId" name="patientId" required>
                <option [ngValue]="0" disabled>{{ 'appointments.selectPatient' | translate }}</option>
                <option *ngFor="let p of patients; trackBy: trackById" [ngValue]="p.id">
                  {{ p.firstName }} {{ p.lastName }}
                </option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="doctorId">{{ 'appointments.doctor' | translate }} *</label>
              <select class="form-select" id="doctorId" [(ngModel)]="appointment.doctorId" name="doctorId"
                      (change)="onDoctorOrDateChange()" required>
                <option [ngValue]="0" disabled>{{ 'appointments.selectDoctor' | translate }}</option>
                <option *ngFor="let d of doctors; trackBy: trackById" [ngValue]="d.id">
                  Dr. {{ d.firstName }} {{ d.lastName }} - {{ d.specialization }}
                </option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="appointmentDate">{{ 'common.date' | translate }} *</label>
              <input type="date" class="form-control" id="appointmentDate"
                     [(ngModel)]="appointment.appointmentDate"
                     name="appointmentDate" (change)="onDoctorOrDateChange()" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="treatmentId">{{ 'appointments.treatment' | translate }} *</label>
              <select class="form-select" id="treatmentId" [(ngModel)]="appointment.treatmentId" name="treatmentId" required>
                <option [ngValue]="0" disabled>{{ 'appointments.selectTreatment' | translate }}</option>
                <option *ngFor="let t of treatments; trackBy: trackById" [ngValue]="t.id">
                  {{ t.name }} - \${{ t.price }} ({{ t.durationMinutes }} {{ 'treatments.minutes' | translate }})
                </option>
              </select>
            </div>
          </div>

          <div class="slots-section" *ngIf="availableSlots.length">
            <label class="form-label">{{ 'appointments.availableSlots' | translate }}</label>
            <div class="slots-grid">
              <button type="button" class="slot-btn"
                      *ngFor="let slot of availableSlots"
                      [class.active]="appointment.startTime === slot.startTime"
                      (click)="selectSlot(slot)">
                {{ slot.startTime }}
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="notes">{{ 'appointments.notes' | translate }}</label>
            <textarea class="form-control" id="notes" [(ngModel)]="appointment.notes"
                      name="notes" rows="2"></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="!isValid() || submitting">
              {{ submitting ? ('common.loading' | translate) : ('common.save' | translate) }}
            </button>
            <a routerLink="/appointments" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
          </div>
        </form>
      </div>
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
    .page-header-back {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .back-link {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      background: var(--gray-100);
      border: 1px solid var(--border-color);
      color: var(--gray-600);
      transition: all 150ms ease;
    }
    .back-link:hover {
      background: var(--primary-light);
      border-color: var(--primary-200);
      color: var(--primary);
    }
    .slots-section {
      margin-bottom: 20px;
    }
    .slots-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .slot-btn {
      padding: 8px 16px;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-full);
      background: #fff;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
      color: var(--gray-600);
      font-family: inherit;
      font-variant-numeric: tabular-nums;
    }
    .slot-btn:hover {
      border-color: var(--primary-200);
      background: var(--primary-light);
      color: var(--primary);
    }
    .slot-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
    }
    .form-actions {
      display: flex;
      gap: 10px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
      margin-top: 8px;
    }
  `]
})
export class AppointmentFormComponent implements OnInit, OnDestroy {
  appointment: CreateAppointmentDto = {
    patientId: 0,
    doctorId: 0,
    appointmentDate: '',
    startTime: '',
    treatmentId: 0,
    notes: ''
  };
  doctors: Doctor[] = [];
  treatments: Treatment[] = [];
  patients: Patient[] = [];
  availableSlots: AvailableSlot[] = [];
  submitting = false;
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getDoctors().pipe(takeUntil(this.destroy$)).subscribe(data => this.doctors = data);
    this.api.getTreatments().pipe(takeUntil(this.destroy$)).subscribe(data => this.treatments = data);
    this.api.getPatients('', 1, 1000).pipe(takeUntil(this.destroy$)).subscribe(result => this.patients = result.data);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  onDoctorOrDateChange() {
    if (this.appointment.doctorId && this.appointment.appointmentDate) {
      this.api.getAvailableSlots(this.appointment.doctorId, this.appointment.appointmentDate)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: response => this.availableSlots = response.availableSlots,
          error: () => this.availableSlots = []
        });
    }
  }

  selectSlot(slot: AvailableSlot) {
    this.appointment.startTime = slot.startTime;
  }

  isValid(): boolean {
    return !!(this.appointment.patientId && this.appointment.doctorId &&
             this.appointment.appointmentDate && this.appointment.startTime &&
             this.appointment.treatmentId);
  }

  onSubmit() {
    this.submitting = true;
    this.api.createAppointment(this.appointment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.router.navigate(['/appointments']),
        error: () => this.submitting = false
      });
  }
}
