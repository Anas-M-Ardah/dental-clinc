import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Patient, CreatePatientDto, Gender } from '../../core/models/patient.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <h2 class="mb-4">{{ isEdit ? ('patients.editPatient' | translate) : ('patients.newPatient' | translate) }}</h2>

    <div class="card">
      <div class="card-body">
        <form (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'patients.firstName' | translate }}</label>
              <input type="text" class="form-control" [(ngModel)]="patient.firstName" 
                     name="firstName" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'patients.lastName' | translate }}</label>
              <input type="text" class="form-control" [(ngModel)]="patient.lastName" 
                     name="lastName" required>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'common.phone' | translate }}</label>
              <input type="text" class="form-control" [(ngModel)]="patient.phone" 
                     name="phone" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'common.email' | translate }}</label>
              <input type="email" class="form-control" [(ngModel)]="patient.email" 
                     name="email">
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'patients.dateOfBirth' | translate }}</label>
              <input type="date" class="form-control" [(ngModel)]="patient.dateOfBirth" 
                     name="dateOfBirth" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'patients.gender' | translate }}</label>
              <select class="form-select" [(ngModel)]="patient.gender" name="gender">
                <option [value]="0">{{ 'patients.male' | translate }}</option>
                <option [value]="1">{{ 'patients.female' | translate }}</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">{{ 'common.address' | translate }}</label>
            <input type="text" class="form-control" [(ngModel)]="patient.address" 
                   name="address">
          </div>

          <div class="mb-3">
            <label class="form-label">{{ 'patients.medicalHistory' | translate }}</label>
            <textarea class="form-control" [(ngModel)]="patient.medicalHistory" 
                      name="medicalHistory" rows="3"></textarea>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">{{ 'common.save' | translate }}</button>
            <a routerLink="/patients" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PatientFormComponent implements OnInit {
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

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.patientId = this.route.snapshot.params['id'];
    if (this.patientId) {
      this.isEdit = true;
      this.api.getPatient(this.patientId).subscribe(p => {
        this.patient = {
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone,
          email: p.email,
          dateOfBirth: p.dateOfBirth.split('T')[0],
          gender: p.gender,
          address: p.address,
          medicalHistory: p.medicalHistory
        };
      });
    }
  }

  onSubmit() {
    if (this.isEdit && this.patientId) {
      this.api.updatePatient(this.patientId, this.patient as any).subscribe(() => {
        this.router.navigate(['/patients']);
      });
    } else {
      this.api.createPatient(this.patient).subscribe(() => {
        this.router.navigate(['/patients']);
      });
    }
  }
}
