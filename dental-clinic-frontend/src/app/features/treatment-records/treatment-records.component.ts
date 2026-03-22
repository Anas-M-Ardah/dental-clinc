import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Patient } from '../../core/models/patient.model';
import { Doctor } from '../../core/models/doctor.model';
import { TreatmentRecord, CreateTreatmentRecordDto } from '../../core/models/treatment-record.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-treatment-records',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>{{ 'treatmentRecords.title' | translate }}</h2>
      <button class="btn btn-primary" (click)="showNewForm = true">{{ 'treatmentRecords.newRecord' | translate }}</button>
    </div>

    <!-- Patient Filter -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <label class="form-label">{{ 'treatmentRecords.selectPatient' | translate }}</label>
            <select class="form-select" [(ngModel)]="selectedPatientId" (change)="loadPatientRecords()">
              <option [ngValue]="null">{{ 'treatmentRecords.selectPatient' | translate }}</option>
              <option *ngFor="let p of patients" [ngValue]="p.id">
                {{ p.firstName }} {{ p.lastName }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Records List -->
    <div class="card" *ngIf="selectedPatientId">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ 'treatmentRecords.treatmentHistory' | translate }}</h5>
        <span class="text-muted">{{ records.length }} {{ 'treatmentRecords.recordsCount' | translate }}</span>
      </div>
      <div class="card-body">
        <div *ngIf="records.length === 0" class="text-muted text-center py-4">
          {{ 'treatmentRecords.noRecords' | translate }}
        </div>
        
        <div *ngFor="let record of records" class="card mb-3 border">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="card-title mb-1">{{ 'treatmentRecords.visitDate' | translate }}: {{ record.visitDate | date:'mediumDate' }}</h6>
                <span class="badge bg-primary me-2">Dr. {{ record.doctorName }}</span>
                <span class="badge bg-info" *ngIf="record.primaryDiagnosis">{{ record.primaryDiagnosis }}</span>
              </div>
              <div>
                <button class="btn btn-sm btn-outline-primary me-1" (click)="viewRecord(record)">{{ 'common.view' | translate }}</button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteRecord(record.id)">{{ 'common.delete' | translate }}</button>
              </div>
            </div>
            
            <div class="row mt-2">
              <div class="col-md-6">
                <small class="text-muted">{{ 'treatmentRecords.chiefComplaintText' | translate }}:</small>
                <p class="mb-1">{{ record.chiefComplaint || '-' }}</p>
              </div>
              <div class="col-md-6">
                <small class="text-muted">{{ 'treatmentRecords.procedurePerformed' | translate }}:</small>
                <p class="mb-1">{{ record.procedurePerformed || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Treatment Record Modal -->
    <div class="modal d-block" *ngIf="showNewForm" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ 'treatmentRecords.newRecord' | translate }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showNewForm = false"></button>
          </div>
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <form (ngSubmit)="saveRecord()">
              <!-- Patient & Visit Info -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2">{{ 'treatmentRecords.patientInfo' | translate }}</h6>
                </div>
                <div class="col-md-3">
                  <label class="form-label">{{ 'appointments.patient' | translate }} *</label>
                  <select class="form-select" [(ngModel)]="newRecord.patientId" name="patientId" required>
                    <option [ngValue]="null">{{ 'treatmentRecords.selectPatient' | translate }}</option>
                    <option *ngFor="let p of patients" [ngValue]="p.id">{{ p.firstName }} {{ p.lastName }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">{{ 'appointments.doctor' | translate }} *</label>
                  <select class="form-select" [(ngModel)]="newRecord.doctorId" name="doctorId" required>
                    <option [ngValue]="null">{{ 'appointments.selectDoctor' | translate }}</option>
                    <option *ngFor="let d of doctors" [ngValue]="d.id">Dr. {{ d.firstName }} {{ d.lastName }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">{{ 'treatmentRecords.visitDate' | translate }} *</label>
                  <input type="date" class="form-control" [(ngModel)]="newRecord.visitDate" name="visitDate" required>
                </div>
                <div class="col-md-3">
                  <label class="form-label">{{ 'treatmentRecords.painLevel' | translate }} (1-10)</label>
                  <input type="number" class="form-control" [(ngModel)]="newRecord.painLevel" name="painLevel" min="0" max="10">
                </div>
              </div>

              <!-- Chief Complaint -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2">{{ 'treatmentRecords.chiefComplaint' | translate }}</h6>
                </div>
                <div class="col-md-8">
                  <label class="form-label">{{ 'treatmentRecords.chiefComplaintText' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.chiefComplaint" name="chiefComplaint" rows="2"></textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ 'treatmentRecords.symptomDuration' | translate }}</label>
                  <input type="text" class="form-control" [(ngModel)]="newRecord.symptomDuration" name="symptomDuration">
                </div>
              </div>

              <!-- Clinical Examination -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2">{{ 'treatmentRecords.clinicalExam' | translate }}</h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ 'treatmentRecords.extraoralFindings' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.extraoralFindings" name="extraoralFindings" rows="2"></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ 'treatmentRecords.intraoralFindings' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.intraoralFindings" name="intraoralFindings" rows="2"></textarea>
                </div>
                <div class="col-md-6 mt-2">
                  <label class="form-label">{{ 'treatmentRecords.teethCondition' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.teethCondition" name="teethCondition" rows="2"></textarea>
                </div>
                <div class="col-md-6 mt-2">
                  <label class="form-label">{{ 'treatmentRecords.gumCondition' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.gumCondition" name="gumCondition" rows="2"></textarea>
                </div>
                <div class="col-md-12 mt-2">
                  <label class="form-label">{{ 'treatmentRecords.radiographicFindings' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.radiographicFindings" name="radiographicFindings" rows="2"></textarea>
                </div>
              </div>

              <!-- Diagnosis -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2">{{ 'treatmentRecords.diagnosis' | translate }}</h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ 'treatmentRecords.primaryDiagnosis' | translate }}</label>
                  <input type="text" class="form-control" [(ngModel)]="newRecord.primaryDiagnosis" name="primaryDiagnosis">
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ 'treatmentRecords.secondaryDiagnoses' | translate }}</label>
                  <input type="text" class="form-control" [(ngModel)]="newRecord.secondaryDiagnoses" name="secondaryDiagnoses">
                </div>
              </div>

              <!-- Treatment Plan -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2">{{ 'treatmentRecords.treatmentPlan' | translate }}</h6>
                </div>
                <div class="col-md-8">
                  <label class="form-label">{{ 'treatmentRecords.proposedPlan' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.treatmentPlan" name="treatmentPlan" rows="2"></textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ 'treatmentRecords.estimatedCost' | translate }}</label>
                  <input type="number" class="form-control" [(ngModel)]="newRecord.estimatedCost" name="estimatedCost">
                </div>
                <div class="col-md-12 mt-2">
                  <label class="form-label">{{ 'treatmentRecords.treatmentStages' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.treatmentStages" name="treatmentStages" rows="2"></textarea>
                </div>
              </div>

              <!-- Procedure Details -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2">{{ 'treatmentRecords.procedure' | translate }}</h6>
                </div>
                <div class="col-md-8">
                  <label class="form-label">{{ 'treatmentRecords.procedurePerformed' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.procedurePerformed" name="procedurePerformed" rows="2"></textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">{{ 'treatmentRecords.duration' | translate }}</label>
                  <input type="number" class="form-control" [(ngModel)]="newRecord.procedureDurationMinutes" name="procedureDurationMinutes">
                </div>
                <div class="col-md-6 mt-2">
                  <label class="form-label">{{ 'treatmentRecords.anaesthesiaUsed' | translate }}</label>
                  <input type="text" class="form-control" [(ngModel)]="newRecord.anaesthesiaUsed" name="anaesthesiaUsed">
                </div>
                <div class="col-md-6 mt-2">
                  <label class="form-label">{{ 'treatmentRecords.materialsUsed' | translate }}</label>
                  <input type="text" class="form-control" [(ngModel)]="newRecord.materialsUsed" name="materialsUsed">
                </div>
                <div class="col-md-12 mt-2">
                  <label class="form-label">{{ 'treatmentRecords.complications' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.complications" name="complications" rows="2"></textarea>
                </div>
              </div>

              <!-- Prescriptions & Instructions -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2">{{ 'treatmentRecords.prescriptions' | translate }}</h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ 'treatmentRecords.prescriptionsText' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.prescriptions" name="prescriptions" rows="3"></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ 'treatmentRecords.postTreatmentInstructions' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.postTreatmentInstructions" name="postTreatmentInstructions" rows="3"></textarea>
                </div>
              </div>

              <!-- Follow-up -->
              <div class="row mb-4">
                <div class="col-12">
                  <h6 class="border-bottom pb-2">{{ 'treatmentRecords.followup' | translate }}</h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ 'treatmentRecords.nextAppointment' | translate }}</label>
                  <input type="date" class="form-control" [(ngModel)]="newRecord.nextAppointmentDate" name="nextAppointmentDate">
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ 'treatmentRecords.recallPeriod' | translate }}</label>
                  <input type="number" class="form-control" [(ngModel)]="newRecord.recallPeriodDays" name="recallPeriodDays">
                </div>
              </div>

              <!-- Notes -->
              <div class="row">
                <div class="col-md-12">
                  <label class="form-label">{{ 'treatmentRecords.additionalNotes' | translate }}</label>
                  <textarea class="form-control" [(ngModel)]="newRecord.notes" name="notes" rows="2"></textarea>
                </div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary" [disabled]="!isValid()">{{ 'treatmentRecords.saveRecord' | translate }}</button>
                <button type="button" class="btn btn-secondary" (click)="showNewForm = false">{{ 'common.cancel' | translate }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- View Record Modal -->
    <div class="modal d-block" *ngIf="viewingRecord" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title">{{ 'treatmentRecords.title' | translate }} - {{ viewingRecord.visitDate | date:'mediumDate' }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="viewingRecord = null"></button>
          </div>
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <div class="row">
              <div class="col-md-4 mb-3">
                <strong>{{ 'appointments.patient' | translate }}:</strong> {{ viewingRecord.patientName }}
              </div>
              <div class="col-md-4 mb-3">
                <strong>{{ 'appointments.doctor' | translate }}:</strong> {{ viewingRecord.doctorName }}
              </div>
              <div class="col-md-4 mb-3">
                <strong>{{ 'treatmentRecords.painLevel' | translate }}:</strong> {{ viewingRecord.painLevel }}/10
              </div>
            </div>

            <h6 class="mt-3">{{ 'treatmentRecords.chiefComplaint' | translate }}</h6>
            <p>{{ viewingRecord.chiefComplaint || '-' }}</p>

            <h6 class="mt-3">{{ 'treatmentRecords.clinicalExam' | translate }}</h6>
            <div class="row">
              <div class="col-md-6">
                <small class="text-muted">{{ 'treatmentRecords.extraoralFindings' | translate }}:</small>
                <p>{{ viewingRecord.extraoralFindings || '-' }}</p>
              </div>
              <div class="col-md-6">
                <small class="text-muted">{{ 'treatmentRecords.intraoralFindings' | translate }}:</small>
                <p>{{ viewingRecord.intraoralFindings || '-' }}</p>
              </div>
              <div class="col-md-6">
                <small class="text-muted">{{ 'treatmentRecords.teethCondition' | translate }}:</small>
                <p>{{ viewingRecord.teethCondition || '-' }}</p>
              </div>
              <div class="col-md-6">
                <small class="text-muted">{{ 'treatmentRecords.gumCondition' | translate }}:</small>
                <p>{{ viewingRecord.gumCondition || '-' }}</p>
              </div>
            </div>

            <h6 class="mt-3">{{ 'treatmentRecords.diagnosis' | translate }}</h6>
            <p><strong>{{ 'treatmentRecords.primaryDiagnosis' | translate }}:</strong> {{ viewingRecord.primaryDiagnosis || '-' }}</p>
            <p><strong>{{ 'treatmentRecords.secondaryDiagnoses' | translate }}:</strong> {{ viewingRecord.secondaryDiagnoses || '-' }}</p>

            <h6 class="mt-3">{{ 'treatmentRecords.treatmentPlan' | translate }}</h6>
            <p>{{ viewingRecord.treatmentPlan || '-' }}</p>
            <p><strong>{{ 'treatmentRecords.estimatedCost' | translate }}:</strong> \${{ viewingRecord.estimatedCost }}</p>

            <h6 class="mt-3">{{ 'treatmentRecords.procedure' | translate }}</h6>
            <p>{{ viewingRecord.procedurePerformed || '-' }}</p>
            <p><strong>{{ 'treatmentRecords.duration' | translate }}:</strong> {{ viewingRecord.procedureDurationMinutes }} {{ 'treatments.minutes' | translate }}</p>
            <p><strong>{{ 'treatmentRecords.anaesthesiaUsed' | translate }}:</strong> {{ viewingRecord.anaesthesiaUsed || '-' }}</p>
            <p><strong>{{ 'treatmentRecords.materialsUsed' | translate }}:</strong> {{ viewingRecord.materialsUsed || '-' }}</p>
            <p><strong>{{ 'treatmentRecords.complications' | translate }}:</strong> {{ viewingRecord.complications || '-' }}</p>

            <h6 class="mt-3">{{ 'treatmentRecords.prescriptionsText' | translate }}</h6>
            <p>{{ viewingRecord.prescriptions || '-' }}</p>

            <h6 class="mt-3">{{ 'treatmentRecords.postTreatmentInstructions' | translate }}</h6>
            <p>{{ viewingRecord.postTreatmentInstructions || '-' }}</p>

            <h6 class="mt-3">{{ 'treatmentRecords.followup' | translate }}</h6>
            <p><strong>{{ 'treatmentRecords.nextAppointment' | translate }}:</strong> {{ viewingRecord.nextAppointmentDate ? (viewingRecord.nextAppointmentDate | date:'mediumDate') : '-' }}</p>
            <p><strong>{{ 'treatmentRecords.recallPeriod' | translate }}:</strong> {{ viewingRecord.recallPeriodDays }} {{ 'treatments.minutes' | translate }}</p>

            <h6 class="mt-3">{{ 'treatmentRecords.additionalNotes' | translate }}</h6>
            <p>{{ viewingRecord.notes || '-' }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="viewingRecord = null">{{ 'common.close' | translate }}</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TreatmentRecordsComponent implements OnInit {
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  records: TreatmentRecord[] = [];
  
  selectedPatientId: number | null = null;
  showNewForm = false;
  viewingRecord: TreatmentRecord | null = null;
  
  newRecord: CreateTreatmentRecordDto = this.getEmptyRecord();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadPatients();
    this.loadDoctors();
    
    const patientId = this.route.snapshot.queryParams['patientId'];
    if (patientId) {
      this.selectedPatientId = +patientId;
      this.loadPatientRecords();
    }
  }

  loadPatients() {
    this.api.getPatients('', 1, 1000).subscribe(r => this.patients = r.data);
  }

  loadDoctors() {
    this.api.getDoctors().subscribe(d => this.doctors = d);
  }

  loadPatientRecords() {
    if (this.selectedPatientId) {
      this.api.getTreatmentRecordsByPatient(this.selectedPatientId).subscribe(r => this.records = r);
    }
  }

  viewRecord(record: TreatmentRecord) {
    this.viewingRecord = record;
  }

  isValid(): boolean {
    return !!(this.newRecord.patientId && this.newRecord.doctorId && this.newRecord.visitDate);
  }

  saveRecord() {
    if (!this.isValid()) return;
    
    this.api.createTreatmentRecord(this.newRecord).subscribe(() => {
      this.showNewForm = false;
      this.newRecord = this.getEmptyRecord();
      if (this.selectedPatientId) {
        this.loadPatientRecords();
      }
    });
  }

  deleteRecord(id: number) {
    if (confirm(this.translate('treatmentRecords.deleteConfirm'))) {
      this.api.deleteTreatmentRecord(id).subscribe(() => this.loadPatientRecords());
    }
  }

  private translate(key: string): string {
    const translations: { [key: string]: string } = {
      'treatmentRecords.deleteConfirm': 'Are you sure you want to delete this record?'
    };
    return translations[key] || key;
  }

  private getEmptyRecord(): CreateTreatmentRecordDto {
    return {
      patientId: 0,
      doctorId: 0,
      visitDate: new Date().toISOString().split('T')[0],
      chiefComplaint: '',
      painLevel: 0,
      symptomDuration: '',
      extraoralFindings: '',
      intraoralFindings: '',
      teethCondition: '',
      gumCondition: '',
      radiographicFindings: '',
      primaryDiagnosis: '',
      secondaryDiagnoses: '',
      treatmentPlan: '',
      treatmentStages: '',
      estimatedCost: 0,
      procedurePerformed: '',
      anaesthesiaUsed: '',
      materialsUsed: '',
      complications: '',
      procedureDurationMinutes: 0,
      prescriptions: '',
      postTreatmentInstructions: '',
      recallPeriodDays: 0,
      notes: ''
    };
  }
}
