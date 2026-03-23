import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { CreatePatientDto, UpdatePatientDto, Gender } from '../../core/models/patient.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header">
      <div class="page-header-back">
        <a routerLink="/patients" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
        </a>
        <h2>{{ isEdit ? ('patients.editPatient' | translate) : ('patients.newPatient' | translate) }}</h2>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <form (ngSubmit)="onSubmit()" #patientForm="ngForm">
          <div class="form-section-title">{{ 'patients.title' | translate }}</div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="firstName">{{ 'patients.firstName' | translate }} *</label>
              <input type="text" class="form-control" id="firstName"
                     [(ngModel)]="patient.firstName" name="firstName" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="lastName">{{ 'patients.lastName' | translate }} *</label>
              <input type="text" class="form-control" id="lastName"
                     [(ngModel)]="patient.lastName" name="lastName" required>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="phone">{{ 'common.phone' | translate }} *</label>
              <input type="text" class="form-control" id="phone"
                     [(ngModel)]="patient.phone" name="phone" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="email">{{ 'common.email' | translate }}</label>
              <input type="email" class="form-control" id="email"
                     [(ngModel)]="patient.email" name="email">
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="dateOfBirth">{{ 'patients.dateOfBirth' | translate }} *</label>
              <input type="date" class="form-control" id="dateOfBirth"
                     [(ngModel)]="patient.dateOfBirth" name="dateOfBirth" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="gender">{{ 'patients.gender' | translate }}</label>
              <select class="form-select" id="gender" [(ngModel)]="patient.gender" name="gender">
                <option [value]="0">{{ 'patients.male' | translate }}</option>
                <option [value]="1">{{ 'patients.female' | translate }}</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="address">{{ 'common.address' | translate }}</label>
            <input type="text" class="form-control" id="address"
                   [(ngModel)]="patient.address" name="address">
          </div>

          <div class="mb-3">
            <label class="form-label" for="medicalHistory">{{ 'patients.medicalHistory' | translate }}</label>
            <textarea class="form-control" id="medicalHistory"
                      [(ngModel)]="patient.medicalHistory" name="medicalHistory" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="submitting || patientForm.invalid">
              <svg *ngIf="!submitting" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ submitting ? ('common.loading' | translate) : ('common.save' | translate) }}
            </button>
            <a routerLink="/patients" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
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
    .form-section-title {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: var(--gray-400);
      margin-bottom: 18px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-color);
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
export class PatientFormComponent implements OnInit, OnDestroy {
  patient: CreatePatientDto = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: Gender.Male,
    address: '',
    medicalHistory: ''
  };
  isEdit = false;
  patientId: number | null = null;
  submitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.patientId = +idParam;
      this.isEdit = true;
      this.api.getPatient(this.patientId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: p => {
            this.patient = {
              firstName: p.firstName,
              lastName: p.lastName,
              phone: p.phone,
              email: p.email,
              dateOfBirth: p.dateOfBirth?.split('T')[0] || '',
              gender: p.gender,
              address: p.address,
              medicalHistory: p.medicalHistory
            };
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.submitting = true;
    const request$ = this.isEdit && this.patientId
      ? this.api.updatePatient(this.patientId, this.patient as UpdatePatientDto)
      : this.api.createPatient(this.patient);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.router.navigate(['/patients']),
      error: () => this.submitting = false
    });
  }
}
