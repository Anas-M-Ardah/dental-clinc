import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
    <h2 class="mb-4">{{ 'appointments.newAppointment' | translate }}</h2>

    <div class="card">
      <div class="card-body">
        <form (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'appointments.patient' | translate }}</label>
              <select class="form-select" [(ngModel)]="appointment.patientId" name="patientId" required>
                <option [ngValue]="null">{{ 'appointments.selectPatient' | translate }}</option>
                <option *ngFor="let p of patients" [ngValue]="p.id">
                  {{ p.firstName }} {{ p.lastName }}
                </option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'appointments.doctor' | translate }}</label>
              <select class="form-select" [(ngModel)]="appointment.doctorId" name="doctorId" 
                      (change)="onDoctorChange()" required>
                <option [ngValue]="null">{{ 'appointments.selectDoctor' | translate }}</option>
                <option *ngFor="let d of doctors" [ngValue]="d.id">
                  Dr. {{ d.firstName }} {{ d.lastName }} - {{ d.specialization }}
                </option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'common.date' | translate }}</label>
              <input type="date" class="form-control" [(ngModel)]="appointment.appointmentDate" 
                     name="appointmentDate" (change)="onDoctorChange()" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ 'appointments.treatment' | translate }}</label>
              <select class="form-select" [(ngModel)]="appointment.treatmentId" name="treatmentId" required>
                <option [ngValue]="null">{{ 'appointments.selectTreatment' | translate }}</option>
                <option *ngFor="let t of treatments" [ngValue]="t.id">
                  {{ t.name }} - \${{ t.price }} ({{ t.durationMinutes }} {{ 'treatments.minutes' | translate }})
                </option>
              </select>
            </div>
          </div>

          <div class="mb-3" *ngIf="availableSlots.length">
            <label class="form-label">{{ 'appointments.availableSlots' | translate }}</label>
            <div class="d-flex flex-wrap gap-2">
              <button type="button" class="btn btn-outline-primary btn-sm" 
                      *ngFor="let slot of availableSlots"
                      [class.active]="appointment.startTime === slot.startTime"
                      (click)="selectSlot(slot)">
                {{ slot.startTime }}
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">{{ 'appointments.notes' | translate }}</label>
            <textarea class="form-control" [(ngModel)]="appointment.notes" 
                      name="notes" rows="2"></textarea>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" [disabled]="!isValid()">{{ 'common.save' | translate }}</button>
            <a routerLink="/appointments" class="btn btn-secondary">{{ 'common.cancel' | translate }}</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AppointmentFormComponent implements OnInit {
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

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getDoctors().subscribe(data => this.doctors = data);
    this.api.getTreatments().subscribe(data => this.treatments = data);
    this.api.getPatients('', 1, 1000).subscribe(result => this.patients = result.data);
  }

  onDoctorChange() {
    if (this.appointment.doctorId && this.appointment.appointmentDate) {
      this.api.getAvailableSlots(this.appointment.doctorId, this.appointment.appointmentDate)
        .subscribe(response => this.availableSlots = response.availableSlots);
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
    this.api.createAppointment(this.appointment).subscribe(() => {
      this.router.navigate(['/appointments']);
    });
  }
}
