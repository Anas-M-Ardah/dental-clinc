import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Patient } from '../../core/models/patient.model';
import { Doctor } from '../../core/models/doctor.model';
import { TreatmentRecord, CreateTreatmentRecordDto } from '../../core/models/treatment-record.model';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-treatment-records',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header">
      <h2>{{ 'treatmentRecords.title' | translate }}</h2>
      <button class="btn btn-primary" (click)="openNewForm()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ 'treatmentRecords.newRecord' | translate }}
      </button>
    </div>

    <!-- Patient Filter -->
    <div class="filters-bar">
      <div class="filter-item" style="max-width: 400px;">
        <label class="form-label" for="patientSelect">{{ 'treatmentRecords.selectPatient' | translate }}</label>
        <select class="form-select" id="patientSelect" [(ngModel)]="selectedPatientId" (change)="loadPatientRecords()">
          <option [ngValue]="null">{{ 'treatmentRecords.selectPatient' | translate }}</option>
          <option *ngFor="let p of patients; trackBy: trackById" [ngValue]="p.id">
            {{ p.firstName }} {{ p.lastName }}
          </option>
        </select>
      </div>
    </div>

    <!-- Records List -->
    <div class="card" *ngIf="selectedPatientId">
      <div class="card-header">
        <h5 class="mb-0">{{ 'treatmentRecords.treatmentHistory' | translate }}</h5>
        <span class="records-count">{{ records.length }} {{ 'treatmentRecords.recordsCount' | translate }}</span>
      </div>
      <div class="card-body">
        <div *ngIf="loadingRecords" class="text-center py-4 text-muted">{{ 'common.loading' | translate }}</div>

        <div class="empty-state" *ngIf="!loadingRecords && records.length === 0">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="color: var(--gray-300);">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>{{ 'treatmentRecords.noRecords' | translate }}</p>
        </div>

        <div *ngFor="let record of records; trackBy: trackById" class="record-card">
          <div class="record-header">
            <div class="record-header-left">
              <div class="record-date-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {{ record.visitDate | date:'mediumDate' }}
              </div>
              <div class="record-badges">
                <span class="badge bg-primary">{{ record.doctorName }}</span>
                <span class="badge bg-info" *ngIf="record.primaryDiagnosis">{{ record.primaryDiagnosis }}</span>
                <span class="badge bg-warning" *ngIf="record.painLevel > 0">Pain: {{ record.painLevel }}/10</span>
              </div>
            </div>
            <div class="record-actions">
              <button class="btn btn-sm btn-outline-primary" (click)="viewRecord(record)">{{ 'common.view' | translate }}</button>
              <button class="btn btn-sm btn-outline-danger" (click)="deleteRecord(record.id)">{{ 'common.delete' | translate }}</button>
            </div>
          </div>
          <div class="record-body">
            <div class="record-field">
              <span class="field-label">{{ 'treatmentRecords.chiefComplaintText' | translate }}</span>
              <span class="field-value">{{ record.chiefComplaint || '-' }}</span>
            </div>
            <div class="record-field">
              <span class="field-label">{{ 'treatmentRecords.procedurePerformed' | translate }}</span>
              <span class="field-value">{{ record.procedurePerformed || '-' }}</span>
            </div>
            <div class="record-field" *ngIf="record.teethCondition">
              <span class="field-label">{{ 'treatmentRecords.toothNumber' | translate }}</span>
              <span class="field-value">{{ record.teethCondition }}</span>
            </div>
            <div class="record-field" *ngIf="record.materialsUsed">
              <span class="field-label">{{ 'treatmentRecords.materialsUsed' | translate }}</span>
              <span class="field-value">{{ record.materialsUsed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== NEW TREATMENT RECORD MODAL ==================== -->
    <div class="modal d-block" *ngIf="showNewForm" style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);" role="dialog" aria-modal="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ 'treatmentRecords.newRecord' | translate }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showNewForm = false" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
            <form (ngSubmit)="saveRecord()">

              <!-- ===== SECTION 1: Patient & Visit Info ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.patientInfo' | translate }}</div>
                <div class="row">
                  <div class="col-md-3 mb-3">
                    <label class="form-label">{{ 'appointments.patient' | translate }} *</label>
                    <select class="form-select" [(ngModel)]="newRecord.patientId" name="patientId" required>
                      <option [ngValue]="0" disabled>{{ 'treatmentRecords.selectPatient' | translate }}</option>
                      <option *ngFor="let p of patients; trackBy: trackById" [ngValue]="p.id">{{ p.firstName }} {{ p.lastName }}</option>
                    </select>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">{{ 'appointments.doctor' | translate }} *</label>
                    <select class="form-select" [(ngModel)]="newRecord.doctorId" name="doctorId" required>
                      <option [ngValue]="0" disabled>{{ 'appointments.selectDoctor' | translate }}</option>
                      <option *ngFor="let d of doctors; trackBy: trackById" [ngValue]="d.id">Dr. {{ d.firstName }} {{ d.lastName }}</option>
                    </select>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.visitDate' | translate }} *</label>
                    <input type="date" class="form-control" [(ngModel)]="newRecord.visitDate" name="visitDate" required>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.priority' | translate }}</label>
                    <select class="form-select" [(ngModel)]="selectedPriority" name="priority">
                      <option value="">--</option>
                      <option value="Urgent">{{ 'treatmentRecords.urgent' | translate }}</option>
                      <option value="High">{{ 'treatmentRecords.high' | translate }}</option>
                      <option value="Medium">{{ 'treatmentRecords.medium' | translate }}</option>
                      <option value="Low">{{ 'treatmentRecords.low' | translate }}</option>
                      <option value="Elective">{{ 'treatmentRecords.elective' | translate }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 2: Chief Complaint & Pain ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.chiefComplaint' | translate }}</div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.chiefComplaintText' | translate }}</label>
                    <textarea class="form-control" [(ngModel)]="newRecord.chiefComplaint" name="chiefComplaint" rows="2"
                              placeholder="e.g., Patient reports sharp pain on lower right side when chewing..."></textarea>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.symptomDuration' | translate }}</label>
                    <select class="form-select" [(ngModel)]="newRecord.symptomDuration" name="symptomDuration">
                      <option value="">--</option>
                      <option value="Today">Today</option>
                      <option value="1-2 days">1-2 days</option>
                      <option value="3-7 days">3-7 days</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="2-4 weeks">2-4 weeks</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6+ months">6+ months</option>
                      <option value="Chronic">Chronic / Recurring</option>
                    </select>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.painLevel' | translate }}</label>
                    <div class="pain-scale">
                      <input type="range" class="pain-slider" min="0" max="10" step="1"
                             [(ngModel)]="newRecord.painLevel" name="painLevel">
                      <div class="pain-labels">
                        <span class="pain-value" [class.no-pain]="newRecord.painLevel === 0"
                              [class.mild]="newRecord.painLevel >= 1 && newRecord.painLevel <= 3"
                              [class.moderate]="newRecord.painLevel >= 4 && newRecord.painLevel <= 6"
                              [class.severe]="newRecord.painLevel >= 7 && newRecord.painLevel <= 9"
                              [class.worst]="newRecord.painLevel === 10">
                          {{ newRecord.painLevel }}/10
                          <small>{{ getPainLabel(newRecord.painLevel) }}</small>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 3: Tooth & Treatment Area ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.toothNumber' | translate }} & {{ 'treatmentRecords.treatmentArea' | translate }}</div>
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.toothNumber' | translate }} (Universal)</label>
                    <select class="form-select" [(ngModel)]="selectedTooth" name="toothNumber" (change)="updateTeethField()">
                      <option value="">{{ 'treatmentRecords.selectTooth' | translate }}</option>
                      <optgroup label="Upper Right (1-8)">
                        <option *ngFor="let t of upperRightTeeth" [value]="t.num">#{{ t.num }} - {{ t.name }}</option>
                      </optgroup>
                      <optgroup label="Upper Left (9-16)">
                        <option *ngFor="let t of upperLeftTeeth" [value]="t.num">#{{ t.num }} - {{ t.name }}</option>
                      </optgroup>
                      <optgroup label="Lower Left (17-24)">
                        <option *ngFor="let t of lowerLeftTeeth" [value]="t.num">#{{ t.num }} - {{ t.name }}</option>
                      </optgroup>
                      <optgroup label="Lower Right (25-32)">
                        <option *ngFor="let t of lowerRightTeeth" [value]="t.num">#{{ t.num }} - {{ t.name }}</option>
                      </optgroup>
                    </select>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.toothSurface' | translate }}</label>
                    <div class="surface-checkboxes">
                      <label class="surface-check" *ngFor="let s of toothSurfaces">
                        <input type="checkbox" [checked]="selectedSurfaces.includes(s.code)"
                               (change)="toggleSurface(s.code)">
                        <span class="surface-label" [title]="s.name">{{ s.code }}</span>
                      </label>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.treatmentArea' | translate }}</label>
                    <select class="form-select" [(ngModel)]="selectedArea" name="treatmentArea">
                      <option value="">--</option>
                      <option value="Tooth">Tooth</option>
                      <option value="Quadrant - Upper Right">Quadrant - Upper Right</option>
                      <option value="Quadrant - Upper Left">Quadrant - Upper Left</option>
                      <option value="Quadrant - Lower Left">Quadrant - Lower Left</option>
                      <option value="Quadrant - Lower Right">Quadrant - Lower Right</option>
                      <option value="Arch - Maxillary">Arch - Maxillary (Upper)</option>
                      <option value="Arch - Mandibular">Arch - Mandibular (Lower)</option>
                      <option value="Full Mouth">Full Mouth</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 4: Clinical Examination ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.clinicalExam' | translate }}</div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.extraoralFindings' | translate }}</label>
                    <select class="form-select" [(ngModel)]="newRecord.extraoralFindings" name="extraoralFindings">
                      <option value="">--</option>
                      <option value="No significant findings">No significant findings</option>
                      <option value="Facial asymmetry noted">Facial asymmetry noted</option>
                      <option value="Swelling present">Swelling present</option>
                      <option value="Lymphadenopathy detected">Lymphadenopathy detected</option>
                      <option value="TMJ clicking/popping">TMJ clicking/popping</option>
                      <option value="TMJ pain on palpation">TMJ pain on palpation</option>
                      <option value="Limited mouth opening">Limited mouth opening</option>
                      <option value="Muscle tenderness">Muscle tenderness</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.intraoralFindings' | translate }}</label>
                    <textarea class="form-control" [(ngModel)]="newRecord.intraoralFindings" name="intraoralFindings" rows="2"
                              placeholder="Soft tissue, oral mucosa, tongue, floor of mouth findings..."></textarea>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.gumCondition' | translate }}</label>
                    <select class="form-select" [(ngModel)]="newRecord.gumCondition" name="gumCondition">
                      <option value="">--</option>
                      <option value="Healthy - pink, firm, stippled">Healthy - pink, firm, stippled</option>
                      <option value="Mild gingivitis - slight redness">Mild gingivitis - slight redness</option>
                      <option value="Moderate gingivitis - bleeding on probing">Moderate gingivitis - bleeding on probing</option>
                      <option value="Severe gingivitis - spontaneous bleeding">Severe gingivitis - spontaneous bleeding</option>
                      <option value="Localized periodontitis">Localized periodontitis</option>
                      <option value="Generalized periodontitis">Generalized periodontitis</option>
                      <option value="Gingival recession present">Gingival recession present</option>
                      <option value="Gingival hyperplasia">Gingival hyperplasia</option>
                      <option value="Periodontal abscess">Periodontal abscess</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.radiographicFindings' | translate }}</label>
                    <select class="form-select" [(ngModel)]="selectedRadioType" name="radioType">
                      <option value="">Type of radiograph...</option>
                      <option value="Periapical">Periapical</option>
                      <option value="Bitewing">Bitewing</option>
                      <option value="Panoramic (OPG)">Panoramic (OPG)</option>
                      <option value="CBCT">CBCT (Cone Beam CT)</option>
                      <option value="Cephalometric">Cephalometric</option>
                      <option value="Occlusal">Occlusal</option>
                      <option value="Not taken">Not taken</option>
                    </select>
                  </div>
                  <div class="col-md-12 mb-3" *ngIf="selectedRadioType && selectedRadioType !== 'Not taken'">
                    <label class="form-label">Radiographic Findings Details</label>
                    <textarea class="form-control" [(ngModel)]="newRecord.radiographicFindings" name="radiographicFindings" rows="2"
                              placeholder="e.g., Radiolucency at apex of #19, bone loss around #30..."></textarea>
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 5: Diagnosis ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.diagnosis' | translate }}</div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.primaryDiagnosis' | translate }}</label>
                    <select class="form-select" [(ngModel)]="newRecord.primaryDiagnosis" name="primaryDiagnosis">
                      <option value="">{{ 'treatmentRecords.selectDiagnosis' | translate }}</option>
                      <optgroup label="Dental Caries">
                        <option value="Dental caries - enamel only">Dental caries - enamel only</option>
                        <option value="Dental caries - into dentin">Dental caries - into dentin</option>
                        <option value="Dental caries - into pulp">Dental caries - into pulp</option>
                        <option value="Root caries">Root caries</option>
                        <option value="Recurrent/secondary caries">Recurrent/secondary caries</option>
                      </optgroup>
                      <optgroup label="Pulp & Periapical">
                        <option value="Reversible pulpitis">Reversible pulpitis</option>
                        <option value="Irreversible pulpitis">Irreversible pulpitis</option>
                        <option value="Pulp necrosis">Pulp necrosis</option>
                        <option value="Periapical abscess">Periapical abscess</option>
                        <option value="Chronic apical periodontitis">Chronic apical periodontitis</option>
                        <option value="Periapical cyst">Periapical cyst</option>
                      </optgroup>
                      <optgroup label="Periodontal">
                        <option value="Gingivitis - plaque induced">Gingivitis - plaque induced</option>
                        <option value="Chronic periodontitis - localized, mild">Chronic periodontitis - localized, mild</option>
                        <option value="Chronic periodontitis - localized, moderate">Chronic periodontitis - localized, moderate</option>
                        <option value="Chronic periodontitis - localized, severe">Chronic periodontitis - localized, severe</option>
                        <option value="Chronic periodontitis - generalized">Chronic periodontitis - generalized</option>
                        <option value="Aggressive periodontitis">Aggressive periodontitis</option>
                        <option value="Periodontal abscess">Periodontal abscess</option>
                        <option value="Gingival recession">Gingival recession</option>
                      </optgroup>
                      <optgroup label="Tooth Damage">
                        <option value="Fractured tooth - enamel only">Fractured tooth - enamel only</option>
                        <option value="Fractured tooth - enamel & dentin">Fractured tooth - enamel & dentin</option>
                        <option value="Fractured tooth - with pulp exposure">Fractured tooth - with pulp exposure</option>
                        <option value="Cracked tooth syndrome">Cracked tooth syndrome</option>
                        <option value="Tooth attrition">Tooth attrition</option>
                        <option value="Tooth abrasion">Tooth abrasion</option>
                        <option value="Tooth erosion">Tooth erosion</option>
                      </optgroup>
                      <optgroup label="Missing / Impacted">
                        <option value="Missing tooth - requiring replacement">Missing tooth - requiring replacement</option>
                        <option value="Impacted tooth - soft tissue">Impacted tooth - soft tissue</option>
                        <option value="Impacted tooth - partially bony">Impacted tooth - partially bony</option>
                        <option value="Impacted tooth - fully bony">Impacted tooth - fully bony</option>
                        <option value="Retained root">Retained root</option>
                      </optgroup>
                      <optgroup label="TMJ / Other">
                        <option value="TMJ disorder">TMJ disorder</option>
                        <option value="Bruxism">Bruxism</option>
                        <option value="Malocclusion">Malocclusion</option>
                        <option value="Dry socket (alveolar osteitis)">Dry socket (alveolar osteitis)</option>
                        <option value="Oral candidiasis">Oral candidiasis</option>
                        <option value="Oral ulcer / Aphthous stomatitis">Oral ulcer / Aphthous stomatitis</option>
                        <option value="Leukoplakia">Leukoplakia</option>
                        <option value="Hypersensitivity">Hypersensitivity</option>
                      </optgroup>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.secondaryDiagnoses' | translate }}</label>
                    <input type="text" class="form-control" [(ngModel)]="newRecord.secondaryDiagnoses" name="secondaryDiagnoses"
                           placeholder="Additional findings...">
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 6: Procedure Performed ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.procedure' | translate }}</div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.procedurePerformed' | translate }}</label>
                    <select class="form-select" [(ngModel)]="newRecord.procedurePerformed" name="procedurePerformed">
                      <option value="">{{ 'treatmentRecords.selectProcedure' | translate }}</option>
                      <optgroup label="Diagnostic">
                        <option value="Periodic oral evaluation">Periodic oral evaluation</option>
                        <option value="Comprehensive oral evaluation">Comprehensive oral evaluation</option>
                        <option value="Limited evaluation - problem focused">Limited evaluation - problem focused</option>
                        <option value="Periapical radiograph">Periapical radiograph</option>
                        <option value="Bitewing radiographs">Bitewing radiographs</option>
                        <option value="Panoramic radiograph">Panoramic radiograph</option>
                        <option value="CBCT scan">CBCT scan</option>
                      </optgroup>
                      <optgroup label="Preventive">
                        <option value="Prophylaxis (cleaning) - adult">Prophylaxis (cleaning) - adult</option>
                        <option value="Prophylaxis (cleaning) - child">Prophylaxis (cleaning) - child</option>
                        <option value="Fluoride varnish application">Fluoride varnish application</option>
                        <option value="Sealant application">Sealant application</option>
                        <option value="Oral hygiene instructions">Oral hygiene instructions</option>
                      </optgroup>
                      <optgroup label="Restorative">
                        <option value="Composite filling - 1 surface">Composite filling - 1 surface</option>
                        <option value="Composite filling - 2 surfaces">Composite filling - 2 surfaces</option>
                        <option value="Composite filling - 3 surfaces">Composite filling - 3 surfaces</option>
                        <option value="Composite filling - 4+ surfaces">Composite filling - 4+ surfaces</option>
                        <option value="Amalgam filling">Amalgam filling</option>
                        <option value="Temporary filling">Temporary filling</option>
                        <option value="Core buildup">Core buildup</option>
                        <option value="Post and core">Post and core</option>
                      </optgroup>
                      <optgroup label="Crown & Bridge">
                        <option value="Crown preparation & impression">Crown preparation & impression</option>
                        <option value="Crown cementation - porcelain/ceramic">Crown cementation - porcelain/ceramic</option>
                        <option value="Crown cementation - PFM">Crown cementation - PFM</option>
                        <option value="Crown cementation - zirconia">Crown cementation - zirconia</option>
                        <option value="Crown cementation - full metal">Crown cementation - full metal</option>
                        <option value="Temporary crown placement">Temporary crown placement</option>
                        <option value="Veneer preparation & placement">Veneer preparation & placement</option>
                        <option value="Bridge preparation">Bridge preparation</option>
                        <option value="Bridge cementation">Bridge cementation</option>
                        <option value="Crown/bridge re-cementation">Crown/bridge re-cementation</option>
                      </optgroup>
                      <optgroup label="Endodontics">
                        <option value="Pulp capping - direct">Pulp capping - direct</option>
                        <option value="Pulp capping - indirect">Pulp capping - indirect</option>
                        <option value="Pulpotomy">Pulpotomy</option>
                        <option value="Root canal - anterior">Root canal - anterior tooth</option>
                        <option value="Root canal - premolar">Root canal - premolar</option>
                        <option value="Root canal - molar">Root canal - molar</option>
                        <option value="Root canal retreatment">Root canal retreatment</option>
                        <option value="Apicoectomy">Apicoectomy</option>
                      </optgroup>
                      <optgroup label="Periodontics">
                        <option value="Scaling and root planing - per quadrant">Scaling and root planing - per quadrant</option>
                        <option value="Full mouth debridement">Full mouth debridement</option>
                        <option value="Periodontal maintenance">Periodontal maintenance</option>
                        <option value="Gingivectomy">Gingivectomy</option>
                        <option value="Osseous surgery">Osseous surgery</option>
                        <option value="Bone graft">Bone graft</option>
                        <option value="Gingival graft">Gingival graft</option>
                        <option value="Crown lengthening">Crown lengthening</option>
                      </optgroup>
                      <optgroup label="Oral Surgery">
                        <option value="Simple extraction">Simple extraction</option>
                        <option value="Surgical extraction">Surgical extraction</option>
                        <option value="Impacted tooth removal - soft tissue">Impacted tooth removal - soft tissue</option>
                        <option value="Impacted tooth removal - partial bony">Impacted tooth removal - partial bony</option>
                        <option value="Impacted tooth removal - full bony">Impacted tooth removal - full bony</option>
                        <option value="Alveoloplasty">Alveoloplasty</option>
                        <option value="Incision and drainage">Incision and drainage</option>
                        <option value="Frenectomy">Frenectomy</option>
                        <option value="Biopsy">Biopsy</option>
                      </optgroup>
                      <optgroup label="Prosthodontics">
                        <option value="Complete denture - upper">Complete denture - upper</option>
                        <option value="Complete denture - lower">Complete denture - lower</option>
                        <option value="Partial denture">Partial denture</option>
                        <option value="Denture adjustment">Denture adjustment</option>
                        <option value="Denture repair">Denture repair</option>
                        <option value="Denture reline">Denture reline</option>
                      </optgroup>
                      <optgroup label="Implants">
                        <option value="Implant placement">Implant placement</option>
                        <option value="Implant second stage surgery">Implant second stage surgery</option>
                        <option value="Implant crown placement">Implant crown placement</option>
                        <option value="Implant maintenance">Implant maintenance</option>
                      </optgroup>
                      <optgroup label="Orthodontics">
                        <option value="Orthodontic consultation">Orthodontic consultation</option>
                        <option value="Bracket placement">Bracket placement</option>
                        <option value="Wire adjustment">Wire adjustment</option>
                        <option value="Aligner delivery">Aligner delivery</option>
                        <option value="Retainer delivery">Retainer delivery</option>
                      </optgroup>
                      <optgroup label="Other">
                        <option value="Teeth whitening">Teeth whitening</option>
                        <option value="Occlusal guard fabrication">Occlusal guard fabrication</option>
                        <option value="Desensitizing treatment">Desensitizing treatment</option>
                        <option value="Emergency palliative treatment">Emergency palliative treatment</option>
                      </optgroup>
                    </select>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.duration' | translate }}</label>
                    <select class="form-select" [(ngModel)]="newRecord.procedureDurationMinutes" name="procedureDuration">
                      <option [ngValue]="0">--</option>
                      <option [ngValue]="15">15 min</option>
                      <option [ngValue]="30">30 min</option>
                      <option [ngValue]="45">45 min</option>
                      <option [ngValue]="60">60 min</option>
                      <option [ngValue]="90">90 min</option>
                      <option [ngValue]="120">120 min</option>
                      <option [ngValue]="150">150 min</option>
                      <option [ngValue]="180">180 min</option>
                    </select>
                  </div>
                  <div class="col-md-3 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.complications' | translate }}</label>
                    <select class="form-select" [(ngModel)]="newRecord.complications" name="complications">
                      <option value="">None</option>
                      <option value="Excessive bleeding">Excessive bleeding</option>
                      <option value="Instrument fracture">Instrument fracture</option>
                      <option value="Root/crown fracture">Root/crown fracture</option>
                      <option value="Nerve paresthesia">Nerve paresthesia</option>
                      <option value="Sinus perforation">Sinus perforation</option>
                      <option value="Allergic reaction">Allergic reaction</option>
                      <option value="Syncope (fainting)">Syncope (fainting)</option>
                      <option value="Dry socket risk">Dry socket risk</option>
                      <option value="Pulp exposure during prep">Pulp exposure during prep</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 7: Anaesthesia ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.anaesthesiaUsed' | translate }}</div>
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.anaesthesiaType' | translate }}</label>
                    <select class="form-select" [(ngModel)]="selectedAnaesthesiaType" name="anaesthesiaType" (change)="updateAnaesthesiaField()">
                      <option value="">None / Not required</option>
                      <optgroup label="Topical">
                        <option value="Topical - Benzocaine 20%">Topical - Benzocaine 20%</option>
                        <option value="Topical - Lidocaine gel">Topical - Lidocaine gel</option>
                      </optgroup>
                      <optgroup label="Local Injectable">
                        <option value="Lidocaine 2% + Epi 1:100,000">Lidocaine 2% + Epi 1:100,000</option>
                        <option value="Articaine 4% + Epi 1:100,000">Articaine 4% + Epi 1:100,000</option>
                        <option value="Articaine 4% + Epi 1:200,000">Articaine 4% + Epi 1:200,000</option>
                        <option value="Mepivacaine 3% (plain)">Mepivacaine 3% (plain / no vasoconstrictor)</option>
                        <option value="Mepivacaine 2% + Levonordefrin">Mepivacaine 2% + Levonordefrin</option>
                        <option value="Prilocaine 4% (plain)">Prilocaine 4% (plain)</option>
                        <option value="Bupivacaine 0.5% + Epi 1:200,000">Bupivacaine 0.5% + Epi 1:200,000</option>
                      </optgroup>
                      <optgroup label="Sedation">
                        <option value="Nitrous oxide / oxygen">Nitrous oxide / oxygen</option>
                        <option value="Oral sedation">Oral sedation</option>
                        <option value="IV conscious sedation">IV conscious sedation</option>
                        <option value="General anaesthesia">General anaesthesia</option>
                      </optgroup>
                    </select>
                  </div>
                  <div class="col-md-4 mb-3" *ngIf="selectedAnaesthesiaType && !selectedAnaesthesiaType.startsWith('Topical')">
                    <label class="form-label">{{ 'treatmentRecords.injectionTechnique' | translate }}</label>
                    <select class="form-select" [(ngModel)]="selectedInjectionTechnique" name="injectionTechnique" (change)="updateAnaesthesiaField()">
                      <option value="">--</option>
                      <option value="Infiltration">Infiltration</option>
                      <option value="Inferior Alveolar Nerve Block">Inferior Alveolar Nerve Block (IANB)</option>
                      <option value="Mental / Incisive Block">Mental / Incisive Block</option>
                      <option value="Long Buccal Block">Long Buccal Block</option>
                      <option value="PSA Block">Posterior Superior Alveolar Block (PSA)</option>
                      <option value="MSA Block">Middle Superior Alveolar Block (MSA)</option>
                      <option value="ASA Block">Anterior Superior Alveolar Block (ASA)</option>
                      <option value="Greater Palatine Block">Greater Palatine Block</option>
                      <option value="Nasopalatine Block">Nasopalatine Block</option>
                      <option value="Infraorbital Block">Infraorbital Block</option>
                      <option value="PDL Injection">Intraligamentary (PDL) Injection</option>
                      <option value="Intraosseous">Intraosseous Injection</option>
                    </select>
                  </div>
                  <div class="col-md-4 mb-3" *ngIf="selectedAnaesthesiaType && selectedAnaesthesiaType.includes('Epi') || selectedAnaesthesiaType?.includes('plain') || selectedAnaesthesiaType?.includes('Levonordefrin')">
                    <label class="form-label">{{ 'treatmentRecords.carpules' | translate }}</label>
                    <select class="form-select" [(ngModel)]="selectedCarpules" name="carpules" (change)="updateAnaesthesiaField()">
                      <option [ngValue]="0">--</option>
                      <option *ngFor="let c of [1,2,3,4,5,6,7,8]" [ngValue]="c">{{ c }} {{ c === 1 ? 'carpule' : 'carpules' }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 8: Materials ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.materialsUsed' | translate }}</div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.selectMaterial' | translate }}</label>
                    <select class="form-select" [(ngModel)]="selectedMaterial" name="materialSelect">
                      <option value="">--</option>
                      <optgroup label="Restorative">
                        <option value="Composite resin">Composite resin (tooth-colored)</option>
                        <option value="Amalgam">Amalgam (silver)</option>
                        <option value="Glass ionomer cement (GIC)">Glass ionomer cement (GIC)</option>
                        <option value="Resin-modified glass ionomer">Resin-modified glass ionomer</option>
                        <option value="Temporary filling material (IRM/Cavit)">Temporary filling (IRM/Cavit)</option>
                      </optgroup>
                      <optgroup label="Crown & Prosthetic">
                        <option value="Porcelain / Ceramic (all-ceramic)">Porcelain / Ceramic</option>
                        <option value="Zirconia">Zirconia</option>
                        <option value="Lithium disilicate (e.max)">Lithium disilicate (e.max)</option>
                        <option value="Porcelain fused to metal (PFM)">Porcelain fused to metal (PFM)</option>
                        <option value="Full cast metal (gold)">Full cast metal (gold)</option>
                        <option value="Stainless steel crown">Stainless steel crown</option>
                        <option value="Acrylic resin">Acrylic resin</option>
                      </optgroup>
                      <optgroup label="Endodontic">
                        <option value="Gutta percha">Gutta percha</option>
                        <option value="MTA (Mineral Trioxide Aggregate)">MTA (Mineral Trioxide Aggregate)</option>
                        <option value="Calcium hydroxide">Calcium hydroxide</option>
                        <option value="Bioceramic sealer">Bioceramic sealer</option>
                      </optgroup>
                      <optgroup label="Bone & Membrane">
                        <option value="Bone graft - autograft">Bone graft - autograft</option>
                        <option value="Bone graft - allograft">Bone graft - allograft</option>
                        <option value="Bone graft - xenograft">Bone graft - xenograft</option>
                        <option value="Collagen membrane">Collagen membrane</option>
                      </optgroup>
                      <optgroup label="Implant">
                        <option value="Titanium implant">Titanium implant</option>
                        <option value="Titanium abutment">Titanium abutment</option>
                        <option value="Zirconia abutment">Zirconia abutment</option>
                      </optgroup>
                      <optgroup label="Cement & Adhesive">
                        <option value="Resin cement">Resin cement</option>
                        <option value="Self-adhesive resin cement">Self-adhesive resin cement</option>
                        <option value="Glass ionomer cement (luting)">Glass ionomer cement (luting)</option>
                        <option value="Temporary cement">Temporary cement</option>
                        <option value="Dental bonding agent">Dental bonding agent</option>
                      </optgroup>
                      <optgroup label="Suture">
                        <option value="Silk sutures">Silk sutures</option>
                        <option value="Vicryl (resorbable) sutures">Vicryl (resorbable) sutures</option>
                        <option value="Chromic gut sutures">Chromic gut sutures</option>
                      </optgroup>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Additional Materials / Details</label>
                    <input type="text" class="form-control" [(ngModel)]="additionalMaterials" name="additionalMaterials"
                           placeholder="Shade, brand, lot number...">
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 9: Treatment Plan ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.treatmentPlan' | translate }}</div>
                <div class="row">
                  <div class="col-md-8 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.proposedPlan' | translate }}</label>
                    <textarea class="form-control" [(ngModel)]="newRecord.treatmentPlan" name="treatmentPlan" rows="2"
                              placeholder="Future treatment plan: e.g., Crown on #19 after RCT completion..."></textarea>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.estimatedCost' | translate }}</label>
                    <input type="number" class="form-control" [(ngModel)]="newRecord.estimatedCost" name="estimatedCost" min="0" step="10">
                  </div>
                  <div class="col-md-12 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.treatmentStages' | translate }}</label>
                    <textarea class="form-control" [(ngModel)]="newRecord.treatmentStages" name="treatmentStages" rows="2"
                              placeholder="e.g., Stage 1: RCT, Stage 2: Post & Core, Stage 3: PFM Crown..."></textarea>
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 10: Prescriptions ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.prescriptions' | translate }}</div>
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.prescriptionsText' | translate }}</label>
                    <div class="rx-quick-buttons">
                      <button type="button" class="rx-btn" *ngFor="let rx of commonPrescriptions"
                              (click)="addPrescription(rx)">+ {{ rx.short }}</button>
                    </div>
                    <textarea class="form-control" [(ngModel)]="newRecord.prescriptions" name="prescriptions" rows="3"
                              placeholder="Medications prescribed..."></textarea>
                  </div>
                  <div class="col-md-12 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.postTreatmentInstructions' | translate }}</label>
                    <div class="rx-quick-buttons">
                      <button type="button" class="rx-btn" *ngFor="let inst of commonInstructions"
                              (click)="addInstruction(inst)">+ {{ inst.short }}</button>
                    </div>
                    <textarea class="form-control" [(ngModel)]="newRecord.postTreatmentInstructions" name="postTreatmentInstructions" rows="3"
                              placeholder="Post-treatment care instructions..."></textarea>
                  </div>
                </div>
              </div>

              <!-- ===== SECTION 11: Follow-up ===== -->
              <div class="form-section">
                <div class="form-section-title">{{ 'treatmentRecords.followup' | translate }}</div>
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.nextAppointment' | translate }}</label>
                    <input type="date" class="form-control" [(ngModel)]="newRecord.nextAppointmentDate" name="nextAppointmentDate">
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.recallInterval' | translate }}</label>
                    <select class="form-select" [(ngModel)]="newRecord.recallPeriodDays" name="recallPeriodDays">
                      <option [ngValue]="0">--</option>
                      <option [ngValue]="7">1 week</option>
                      <option [ngValue]="14">2 weeks</option>
                      <option [ngValue]="30">1 month</option>
                      <option [ngValue]="90">3 months</option>
                      <option [ngValue]="120">4 months</option>
                      <option [ngValue]="180">6 months</option>
                      <option [ngValue]="365">12 months</option>
                    </select>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'treatmentRecords.additionalNotes' | translate }}</label>
                    <textarea class="form-control" [(ngModel)]="newRecord.notes" name="notes" rows="2"></textarea>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="!isValid() || submitting">
                  {{ submitting ? ('common.loading' | translate) : ('treatmentRecords.saveRecord' | translate) }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="showNewForm = false">{{ 'common.cancel' | translate }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== VIEW RECORD MODAL ==================== -->
    <div class="modal d-block" *ngIf="viewingRecord" style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);" role="dialog" aria-modal="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title">{{ 'treatmentRecords.title' | translate }} - {{ viewingRecord.visitDate | date:'mediumDate' }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="viewingRecord = null" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <div class="view-info-grid">
              <div class="view-info-item">
                <span class="view-label">{{ 'appointments.patient' | translate }}</span>
                <span class="view-value">{{ viewingRecord.patientName }}</span>
              </div>
              <div class="view-info-item">
                <span class="view-label">{{ 'appointments.doctor' | translate }}</span>
                <span class="view-value">{{ viewingRecord.doctorName }}</span>
              </div>
              <div class="view-info-item">
                <span class="view-label">{{ 'treatmentRecords.painLevel' | translate }}</span>
                <span class="view-value">{{ viewingRecord.painLevel }}/10 ({{ getPainLabel(viewingRecord.painLevel) }})</span>
              </div>
            </div>

            <div class="view-section" *ngIf="viewingRecord.chiefComplaint">
              <h6>{{ 'treatmentRecords.chiefComplaint' | translate }}</h6>
              <p>{{ viewingRecord.chiefComplaint }}</p>
              <small class="text-muted" *ngIf="viewingRecord.symptomDuration">Duration: {{ viewingRecord.symptomDuration }}</small>
            </div>

            <div class="view-section" *ngIf="viewingRecord.teethCondition">
              <h6>{{ 'treatmentRecords.toothNumber' | translate }}</h6>
              <p>{{ viewingRecord.teethCondition }}</p>
            </div>

            <div class="view-section">
              <h6>{{ 'treatmentRecords.clinicalExam' | translate }}</h6>
              <div class="view-grid-2">
                <div *ngIf="viewingRecord.extraoralFindings">
                  <small class="text-muted">{{ 'treatmentRecords.extraoralFindings' | translate }}</small>
                  <p>{{ viewingRecord.extraoralFindings }}</p>
                </div>
                <div *ngIf="viewingRecord.intraoralFindings">
                  <small class="text-muted">{{ 'treatmentRecords.intraoralFindings' | translate }}</small>
                  <p>{{ viewingRecord.intraoralFindings }}</p>
                </div>
                <div *ngIf="viewingRecord.gumCondition">
                  <small class="text-muted">{{ 'treatmentRecords.gumCondition' | translate }}</small>
                  <p>{{ viewingRecord.gumCondition }}</p>
                </div>
                <div *ngIf="viewingRecord.radiographicFindings">
                  <small class="text-muted">{{ 'treatmentRecords.radiographicFindings' | translate }}</small>
                  <p>{{ viewingRecord.radiographicFindings }}</p>
                </div>
              </div>
            </div>

            <div class="view-section">
              <h6>{{ 'treatmentRecords.diagnosis' | translate }}</h6>
              <p><strong>{{ viewingRecord.primaryDiagnosis || '-' }}</strong></p>
              <p *ngIf="viewingRecord.secondaryDiagnoses"><small class="text-muted">Secondary:</small> {{ viewingRecord.secondaryDiagnoses }}</p>
            </div>

            <div class="view-section" *ngIf="viewingRecord.procedurePerformed">
              <h6>{{ 'treatmentRecords.procedure' | translate }}</h6>
              <p>{{ viewingRecord.procedurePerformed }}</p>
              <div class="view-grid-2">
                <div *ngIf="viewingRecord.procedureDurationMinutes">
                  <small class="text-muted">{{ 'treatmentRecords.duration' | translate }}</small>
                  <p>{{ viewingRecord.procedureDurationMinutes }} {{ 'treatments.minutes' | translate }}</p>
                </div>
                <div *ngIf="viewingRecord.anaesthesiaUsed">
                  <small class="text-muted">{{ 'treatmentRecords.anaesthesiaUsed' | translate }}</small>
                  <p>{{ viewingRecord.anaesthesiaUsed }}</p>
                </div>
                <div *ngIf="viewingRecord.materialsUsed">
                  <small class="text-muted">{{ 'treatmentRecords.materialsUsed' | translate }}</small>
                  <p>{{ viewingRecord.materialsUsed }}</p>
                </div>
                <div *ngIf="viewingRecord.complications">
                  <small class="text-muted">{{ 'treatmentRecords.complications' | translate }}</small>
                  <p>{{ viewingRecord.complications }}</p>
                </div>
              </div>
            </div>

            <div class="view-section" *ngIf="viewingRecord.treatmentPlan">
              <h6>{{ 'treatmentRecords.treatmentPlan' | translate }}</h6>
              <p>{{ viewingRecord.treatmentPlan }}</p>
              <p *ngIf="viewingRecord.estimatedCost"><strong>{{ 'treatmentRecords.estimatedCost' | translate }}:</strong> \${{ viewingRecord.estimatedCost }}</p>
            </div>

            <div class="view-section" *ngIf="viewingRecord.prescriptions">
              <h6>{{ 'treatmentRecords.prescriptionsText' | translate }}</h6>
              <pre class="rx-text">{{ viewingRecord.prescriptions }}</pre>
            </div>

            <div class="view-section" *ngIf="viewingRecord.postTreatmentInstructions">
              <h6>{{ 'treatmentRecords.postTreatmentInstructions' | translate }}</h6>
              <pre class="rx-text">{{ viewingRecord.postTreatmentInstructions }}</pre>
            </div>

            <div class="view-section" *ngIf="viewingRecord.nextAppointmentDate || viewingRecord.recallPeriodDays">
              <h6>{{ 'treatmentRecords.followup' | translate }}</h6>
              <div class="view-grid-2">
                <div *ngIf="viewingRecord.nextAppointmentDate">
                  <small class="text-muted">{{ 'treatmentRecords.nextAppointment' | translate }}</small>
                  <p>{{ viewingRecord.nextAppointmentDate | date:'mediumDate' }}</p>
                </div>
                <div *ngIf="viewingRecord.recallPeriodDays">
                  <small class="text-muted">{{ 'treatmentRecords.recallInterval' | translate }}</small>
                  <p>{{ viewingRecord.recallPeriodDays }} {{ 'treatments.days' | translate }}</p>
                </div>
              </div>
            </div>

            <div class="view-section" *ngIf="viewingRecord.notes">
              <h6>{{ 'treatmentRecords.additionalNotes' | translate }}</h6>
              <p>{{ viewingRecord.notes }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="viewingRecord = null">{{ 'common.close' | translate }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 20px; padding: 20px 24px; background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-xs); }
    .filter-item { min-width: 0; flex: 1; }
    .records-count { font-size: 0.82rem; color: var(--gray-500); font-weight: 500; }
    .record-card { border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 14px; transition: all 200ms ease; background: #fff; }
    .record-card:hover { border-color: var(--primary-200); box-shadow: var(--shadow-sm); }
    .record-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .record-header-left { display: flex; flex-direction: column; gap: 8px; }
    .record-date-icon { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--gray-800); font-size: 0.9rem; }
    .record-date-icon svg { color: var(--gray-400); }
    .record-badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .record-actions { display: flex; gap: 6px; flex-shrink: 0; }
    .record-body { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 14px; border-top: 1px solid var(--gray-100); }
    .record-field { display: flex; flex-direction: column; gap: 2px; }
    .field-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: var(--gray-400); }
    .field-value { font-size: 0.85rem; color: var(--gray-700); }
    .form-section { margin-bottom: 24px; }
    .form-section-title { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: var(--gray-400); margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); }
    .form-actions { display: flex; gap: 10px; padding-top: 20px; border-top: 1px solid var(--border-color); }

    /* Pain scale */
    .pain-scale { display: flex; flex-direction: column; gap: 8px; }
    .pain-slider { width: 100%; height: 6px; -webkit-appearance: none; appearance: none; border-radius: 3px; background: linear-gradient(to right, #10b981, #f59e0b, #ef4444); outline: none; cursor: pointer; }
    .pain-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 2px solid var(--primary); cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
    .pain-labels { text-align: center; }
    .pain-value { font-weight: 700; font-size: 0.9rem; display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .pain-value small { font-weight: 500; font-size: 0.72rem; }
    .pain-value.no-pain { color: var(--success); }
    .pain-value.mild { color: #65a30d; }
    .pain-value.moderate { color: var(--warning-dark); }
    .pain-value.severe { color: #ea580c; }
    .pain-value.worst { color: var(--danger); }

    /* Tooth surfaces */
    .surface-checkboxes { display: flex; flex-wrap: wrap; gap: 6px; }
    .surface-check { display: flex; align-items: center; cursor: pointer; }
    .surface-check input { display: none; }
    .surface-label { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1.5px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 600; color: var(--gray-500); transition: all 150ms ease; cursor: pointer; }
    .surface-check input:checked + .surface-label { background: var(--primary); border-color: var(--primary); color: #fff; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25); }
    .surface-label:hover { border-color: var(--primary-200); }

    /* Quick prescription buttons */
    .rx-quick-buttons { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
    .rx-btn { padding: 4px 10px; font-size: 0.72rem; font-weight: 500; border: 1px solid var(--border-color); border-radius: var(--radius-full); background: var(--gray-50); color: var(--gray-600); cursor: pointer; transition: all 150ms ease; font-family: inherit; }
    .rx-btn:hover { background: var(--primary-light); border-color: var(--primary-200); color: var(--primary); }

    /* View modal */
    .view-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color); }
    .view-info-item { display: flex; flex-direction: column; gap: 4px; }
    .view-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--gray-400); }
    .view-value { font-weight: 600; color: var(--gray-800); }
    .view-section { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--gray-100); }
    .view-section h6 { font-size: 0.85rem; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; }
    .view-section p { margin-bottom: 4px; color: var(--gray-600); font-size: 0.88rem; }
    .view-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .rx-text { background: var(--gray-50); padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.84rem; color: var(--gray-700); white-space: pre-wrap; font-family: inherit; border: 1px solid var(--border-color); margin: 0; }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 24px; gap: 12px; }
    .empty-state p { color: var(--gray-400); font-weight: 500; margin: 0; }

    @media (max-width: 768px) {
      .record-body, .view-grid-2, .view-info-grid { grid-template-columns: 1fr; }
      .record-header { flex-direction: column; }
    }
  `]
})
export class TreatmentRecordsComponent implements OnInit, OnDestroy {
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  records: TreatmentRecord[] = [];

  selectedPatientId: number | null = null;
  showNewForm = false;
  viewingRecord: TreatmentRecord | null = null;
  loadingRecords = false;
  submitting = false;

  // Form helper fields
  selectedTooth = '';
  selectedSurfaces: string[] = [];
  selectedArea = '';
  selectedPriority = '';
  selectedRadioType = '';
  selectedAnaesthesiaType = '';
  selectedInjectionTechnique = '';
  selectedCarpules = 0;
  selectedMaterial = '';
  additionalMaterials = '';

  newRecord: CreateTreatmentRecordDto = this.getEmptyRecord();
  private destroy$ = new Subject<void>();

  // Tooth data - Universal Numbering System
  upperRightTeeth = [
    { num: 1, name: '3rd Molar (Wisdom)' }, { num: 2, name: '2nd Molar' }, { num: 3, name: '1st Molar' },
    { num: 4, name: '2nd Premolar' }, { num: 5, name: '1st Premolar' }, { num: 6, name: 'Canine' },
    { num: 7, name: 'Lateral Incisor' }, { num: 8, name: 'Central Incisor' }
  ];
  upperLeftTeeth = [
    { num: 9, name: 'Central Incisor' }, { num: 10, name: 'Lateral Incisor' }, { num: 11, name: 'Canine' },
    { num: 12, name: '1st Premolar' }, { num: 13, name: '2nd Premolar' }, { num: 14, name: '1st Molar' },
    { num: 15, name: '2nd Molar' }, { num: 16, name: '3rd Molar (Wisdom)' }
  ];
  lowerLeftTeeth = [
    { num: 17, name: '3rd Molar (Wisdom)' }, { num: 18, name: '2nd Molar' }, { num: 19, name: '1st Molar' },
    { num: 20, name: '2nd Premolar' }, { num: 21, name: '1st Premolar' }, { num: 22, name: 'Canine' },
    { num: 23, name: 'Lateral Incisor' }, { num: 24, name: 'Central Incisor' }
  ];
  lowerRightTeeth = [
    { num: 25, name: 'Central Incisor' }, { num: 26, name: 'Lateral Incisor' }, { num: 27, name: 'Canine' },
    { num: 28, name: '1st Premolar' }, { num: 29, name: '2nd Premolar' }, { num: 30, name: '1st Molar' },
    { num: 31, name: '2nd Molar' }, { num: 32, name: '3rd Molar (Wisdom)' }
  ];

  toothSurfaces = [
    { code: 'M', name: 'Mesial' }, { code: 'D', name: 'Distal' }, { code: 'O', name: 'Occlusal' },
    { code: 'B', name: 'Buccal' }, { code: 'L', name: 'Lingual' }, { code: 'I', name: 'Incisal' },
    { code: 'F', name: 'Facial' }
  ];

  commonPrescriptions = [
    { short: 'Amoxicillin', full: 'Amoxicillin 500mg - 1 cap TID x 7 days' },
    { short: 'Ibuprofen', full: 'Ibuprofen 400mg - 1 tab every 6-8 hrs as needed for pain' },
    { short: 'Acetaminophen', full: 'Acetaminophen 500mg - 1-2 tabs every 6 hrs as needed' },
    { short: 'Clindamycin', full: 'Clindamycin 300mg - 1 cap QID x 7 days (penicillin allergy)' },
    { short: 'Metronidazole', full: 'Metronidazole 500mg - 1 tab TID x 7 days' },
    { short: 'Chlorhexidine', full: 'Chlorhexidine 0.12% rinse - Rinse 15ml BID x 14 days' },
    { short: 'Augmentin', full: 'Amoxicillin/Clavulanate 875/125mg - 1 tab BID x 7 days' },
    { short: 'Dexamethasone', full: 'Dexamethasone 4mg - Pre/post-surgical dose' }
  ];

  commonInstructions = [
    { short: 'Post-Extraction', full: 'Bite on gauze for 30-45 min. No spitting, straws, or smoking for 24 hrs. Soft diet. Avoid hot foods/drinks. Rinse gently with warm salt water after 24 hrs.' },
    { short: 'Post-RCT', full: 'Avoid chewing on treated tooth until permanent restoration. Mild discomfort is normal for 2-3 days. Take prescribed medication. Contact if severe pain or swelling.' },
    { short: 'Post-Filling', full: 'Numbness may last 1-3 hours. Avoid biting cheek/tongue. Slight sensitivity is normal. Contact if bite feels high.' },
    { short: 'Post-Crown', full: 'Temporary crown: Avoid sticky foods, chew on opposite side. Permanent crown: Normal use after 24 hrs. Mild sensitivity may occur.' },
    { short: 'Post-Scaling', full: 'Mild sensitivity and bleeding may occur for 1-2 days. Brush and floss gently. Rinse with warm salt water. Avoid spicy/acidic foods.' },
    { short: 'Post-Surgery', full: 'Apply ice pack 20 min on/20 min off for first 24 hrs. Soft/liquid diet for 48 hrs. No vigorous rinsing. Take all medications as prescribed.' }
  ];

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private translation: TranslationService
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  getPainLabel(level: number): string {
    if (level === 0) return this.translation.instant('treatmentRecords.noPain');
    if (level <= 3) return this.translation.instant('treatmentRecords.mild');
    if (level <= 6) return this.translation.instant('treatmentRecords.moderate');
    if (level <= 9) return this.translation.instant('treatmentRecords.severe');
    return this.translation.instant('treatmentRecords.worst');
  }

  toggleSurface(code: string) {
    const idx = this.selectedSurfaces.indexOf(code);
    if (idx >= 0) {
      this.selectedSurfaces.splice(idx, 1);
    } else {
      this.selectedSurfaces.push(code);
    }
    this.updateTeethField();
  }

  updateTeethField() {
    const parts: string[] = [];
    if (this.selectedTooth) parts.push(`#${this.selectedTooth}`);
    if (this.selectedSurfaces.length) parts.push(this.selectedSurfaces.join(''));
    if (this.selectedArea) parts.push(`(${this.selectedArea})`);
    this.newRecord.teethCondition = parts.join(' ');
  }

  updateAnaesthesiaField() {
    let val = this.selectedAnaesthesiaType;
    if (this.selectedInjectionTechnique) val += ` - ${this.selectedInjectionTechnique}`;
    if (this.selectedCarpules > 0) val += ` (${this.selectedCarpules} carpule${this.selectedCarpules > 1 ? 's' : ''})`;
    this.newRecord.anaesthesiaUsed = val;
  }

  addPrescription(rx: { short: string; full: string }) {
    const current = this.newRecord.prescriptions.trim();
    this.newRecord.prescriptions = current ? `${current}\n${rx.full}` : rx.full;
  }

  addInstruction(inst: { short: string; full: string }) {
    const current = this.newRecord.postTreatmentInstructions.trim();
    this.newRecord.postTreatmentInstructions = current ? `${current}\n${inst.full}` : inst.full;
  }

  openNewForm() {
    this.newRecord = this.getEmptyRecord();
    this.selectedTooth = '';
    this.selectedSurfaces = [];
    this.selectedArea = '';
    this.selectedPriority = '';
    this.selectedRadioType = '';
    this.selectedAnaesthesiaType = '';
    this.selectedInjectionTechnique = '';
    this.selectedCarpules = 0;
    this.selectedMaterial = '';
    this.additionalMaterials = '';
    this.showNewForm = true;
  }

  loadPatients() {
    this.api.getPatients('', 1, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: r => this.patients = r.data });
  }

  loadDoctors() {
    this.api.getDoctors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: d => this.doctors = d });
  }

  loadPatientRecords() {
    if (this.selectedPatientId) {
      this.loadingRecords = true;
      this.api.getTreatmentRecordsByPatient(this.selectedPatientId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: r => { this.records = r; this.loadingRecords = false; },
          error: () => this.loadingRecords = false
        });
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
    this.submitting = true;

    // Combine material fields
    const materials: string[] = [];
    if (this.selectedMaterial) materials.push(this.selectedMaterial);
    if (this.additionalMaterials) materials.push(this.additionalMaterials);
    this.newRecord.materialsUsed = materials.join(' | ');

    // Add radiograph type to findings
    if (this.selectedRadioType && this.selectedRadioType !== 'Not taken' && this.newRecord.radiographicFindings) {
      this.newRecord.radiographicFindings = `[${this.selectedRadioType}] ${this.newRecord.radiographicFindings}`;
    }

    this.api.createTreatmentRecord(this.newRecord)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNewForm = false;
          this.submitting = false;
          this.newRecord = this.getEmptyRecord();
          if (this.selectedPatientId) {
            this.loadPatientRecords();
          }
        },
        error: () => this.submitting = false
      });
  }

  deleteRecord(id: number) {
    if (confirm(this.translation.instant('treatmentRecords.deleteConfirm'))) {
      this.api.deleteTreatmentRecord(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadPatientRecords());
    }
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
