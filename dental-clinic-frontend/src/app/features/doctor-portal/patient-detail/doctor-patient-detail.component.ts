import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { Patient } from '../../../core/models/patient.model';
import { TreatmentRecord } from '../../../core/models/treatment-record.model';

interface AllergyRow { id: number; allergyName: string; severity?: string; notes?: string; createdAt: string; }
interface MedicationRow { id: number; medicationName: string; dosage?: string; frequency?: string; isActive: boolean; notes?: string; createdAt: string; }
interface ConditionRow { id: number; conditionName: string; diagnosedDate?: string; isActive: boolean; notes?: string; createdAt: string; }
interface DocumentRow { id: number; fileName: string; contentType: string; fileSize: number; type: number; typeName: string; description?: string; uploadedAt: string; uploadedBy?: string; }

@Component({
  selector: 'app-doctor-patient-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--gray-500); font-size: 0.82rem; text-decoration: none; margin-bottom: 12px; }
    .back-link:hover { color: #0284c7; }
    .patient-header { background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 22px; }
    .patient-header h1 { font-size: 1.4rem; font-weight: 700; color: var(--gray-900); margin: 0 0 6px; letter-spacing: -0.025em; }
    .patient-meta { display: flex; flex-wrap: wrap; gap: 18px; font-size: 0.85rem; color: var(--gray-600); }
    .patient-meta span { display: inline-flex; align-items: center; gap: 6px; }

    .tabs { display: inline-flex; padding: 4px; background: var(--gray-100); border-radius: var(--radius-md); margin-bottom: 18px; }
    .tab-btn { padding: 8px 16px; border: none; background: transparent; font-size: 0.85rem; font-weight: 600; color: var(--gray-600); cursor: pointer; border-radius: var(--radius-sm); font-family: inherit; transition: all var(--transition-fast); }
    .tab-btn.active { background: #fff; color: #0284c7; box-shadow: var(--shadow-sm); }
    .panel { background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 18px; }
    .panel h3 { font-size: 0.95rem; font-weight: 700; color: var(--gray-900); margin: 0 0 14px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid var(--border-light); border-radius: var(--radius-md); margin-bottom: 6px; font-size: 0.86rem; }
    .row .name { font-weight: 600; color: var(--gray-900); }
    .row .meta { color: var(--gray-500); font-size: 0.78rem; margin-top: 2px; }
    .row .del { color: #b91c1c; background: none; border: none; cursor: pointer; font-size: 0.78rem; font-weight: 600; }
    .add-form { display: grid; grid-template-columns: 2fr 1fr 2fr auto; gap: 8px; margin-top: 12px; align-items: start; }
    .add-form input, .add-form select, .add-form textarea {
      width: 100%; padding: 8px 10px;
      border: 1.5px solid var(--border-color); border-radius: var(--radius-md);
      font-size: 0.82rem; font-family: inherit; box-sizing: border-box;
    }
    .btn { padding: 8px 14px; border: none; border-radius: var(--radius-md); font-weight: 600; font-size: 0.82rem; cursor: pointer; font-family: inherit; }
    .btn-primary { background: #0284c7; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #0369a1; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .empty-line { padding: 14px; text-align: center; color: var(--gray-400); font-size: 0.82rem; font-style: italic; }
    .record-card { padding: 14px; border: 1px solid var(--border-light); border-radius: var(--radius-md); margin-bottom: 8px; }
    .record-date { font-size: 0.78rem; color: #0284c7; font-weight: 700; }
    .record-title { font-weight: 600; color: var(--gray-900); margin: 4px 0 2px; }
    .record-text { font-size: 0.82rem; color: var(--gray-600); line-height: 1.5; }
    .record-row { display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.78rem; color: var(--gray-500); margin-top: 6px; }
    .record-row span { background: var(--gray-50); padding: 2px 8px; border-radius: var(--radius-full); }
    .new-record-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .full-row { grid-column: 1 / -1; }
    .field-label { display: block; font-size: 0.74rem; font-weight: 600; color: var(--gray-600); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-input, .field-textarea {
      width: 100%; padding: 9px 11px;
      border: 1.5px solid var(--border-color); border-radius: var(--radius-md);
      font-size: 0.84rem; font-family: inherit; box-sizing: border-box;
    }
    .field-textarea { min-height: 80px; resize: vertical; }
    .doc-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid var(--border-light); border-radius: var(--radius-md); margin-bottom: 6px; font-size: 0.86rem; }
    .doc-meta { font-size: 0.74rem; color: var(--gray-500); margin-top: 2px; }
    .upload-form { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 8px; margin-top: 12px; }
    .upload-form input, .upload-form select { padding: 8px 10px; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.82rem; font-family: inherit; box-sizing: border-box; }
    .loading { padding: 28px; text-align: center; color: var(--gray-400); }
    .pain-slider { width: 100%; }
  `],
  template: `
    <a routerLink="/doctor/appointments" class="back-link">← Back to appointments</a>

    <div *ngIf="loading" class="loading">Loading patient data…</div>

    <ng-container *ngIf="!loading && patient">
      <div class="patient-header">
        <h1>{{ patient.firstName }} {{ patient.lastName }}</h1>
        <div class="patient-meta">
          <span>📞 {{ patient.phone }}</span>
          <span *ngIf="patient.email">✉ {{ patient.email }}</span>
          <span>🎂 {{ formatDate(patient.dateOfBirth) }}</span>
          <span>{{ patient.gender === 0 ? 'Male' : 'Female' }}</span>
        </div>
      </div>

      <div class="tabs">
        <button class="tab-btn" [class.active]="activeTab === 'history'" (click)="activeTab = 'history'">Medical History</button>
        <button class="tab-btn" [class.active]="activeTab === 'records'" (click)="activeTab = 'records'">Treatment Records</button>
        <button class="tab-btn" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'">Documents</button>
      </div>

      <!-- ===== Medical History Tab ===== -->
      <ng-container *ngIf="activeTab === 'history'">
        <div class="panel">
          <h3>Allergies</h3>
          <div *ngIf="allergies.length === 0" class="empty-line">No allergies recorded.</div>
          <div *ngFor="let a of allergies" class="row">
            <div>
              <div class="name">{{ a.allergyName }} <span *ngIf="a.severity" style="color:#b91c1c;font-size:0.75rem;">· {{ a.severity }}</span></div>
              <div class="meta" *ngIf="a.notes">{{ a.notes }}</div>
            </div>
            <button class="del" (click)="deleteAllergy(a.id)">Delete</button>
          </div>
          <div class="add-form">
            <input [(ngModel)]="newAllergy.allergyName" placeholder="Allergy name" />
            <select [(ngModel)]="newAllergy.severity">
              <option value="">Severity</option>
              <option>Mild</option><option>Moderate</option><option>Severe</option>
            </select>
            <input [(ngModel)]="newAllergy.notes" placeholder="Notes (optional)" />
            <button class="btn btn-primary" [disabled]="!newAllergy.allergyName" (click)="addAllergy()">Add</button>
          </div>
        </div>

        <div class="panel">
          <h3>Medications</h3>
          <div *ngIf="medications.length === 0" class="empty-line">No medications recorded.</div>
          <div *ngFor="let m of medications" class="row">
            <div>
              <div class="name">{{ m.medicationName }} <span *ngIf="m.dosage" style="color:var(--gray-500);font-size:0.78rem;">· {{ m.dosage }}</span><span *ngIf="m.frequency" style="color:var(--gray-500);font-size:0.78rem;"> · {{ m.frequency }}</span></div>
              <div class="meta" *ngIf="m.notes">{{ m.notes }}</div>
            </div>
            <button class="del" (click)="deleteMedication(m.id)">Delete</button>
          </div>
          <div class="add-form">
            <input [(ngModel)]="newMedication.medicationName" placeholder="Medication" />
            <input [(ngModel)]="newMedication.dosage" placeholder="Dosage" />
            <input [(ngModel)]="newMedication.frequency" placeholder="Frequency" />
            <button class="btn btn-primary" [disabled]="!newMedication.medicationName" (click)="addMedication()">Add</button>
          </div>
        </div>

        <div class="panel">
          <h3>Conditions</h3>
          <div *ngIf="conditions.length === 0" class="empty-line">No conditions recorded.</div>
          <div *ngFor="let c of conditions" class="row">
            <div>
              <div class="name">{{ c.conditionName }}<span *ngIf="c.diagnosedDate" style="color:var(--gray-500);font-size:0.78rem;"> · diagnosed {{ formatDate(c.diagnosedDate) }}</span></div>
              <div class="meta" *ngIf="c.notes">{{ c.notes }}</div>
            </div>
            <button class="del" (click)="deleteCondition(c.id)">Delete</button>
          </div>
          <div class="add-form">
            <input [(ngModel)]="newCondition.conditionName" placeholder="Condition" />
            <input type="date" [(ngModel)]="newCondition.diagnosedDate" />
            <input [(ngModel)]="newCondition.notes" placeholder="Notes (optional)" />
            <button class="btn btn-primary" [disabled]="!newCondition.conditionName" (click)="addCondition()">Add</button>
          </div>
        </div>
      </ng-container>

      <!-- ===== Treatment Records Tab ===== -->
      <ng-container *ngIf="activeTab === 'records'">
        <div class="panel">
          <h3>Previous Treatment Records ({{ records.length }})</h3>
          <div *ngIf="records.length === 0" class="empty-line">No records yet.</div>
          <div *ngFor="let r of records" class="record-card">
            <div class="record-date">{{ formatDate(r.visitDate) }} · {{ r.doctorName }}</div>
            <div class="record-title">{{ r.primaryDiagnosis || r.chiefComplaint || 'Clinical visit' }}</div>
            <div class="record-text" *ngIf="r.procedurePerformed">{{ r.procedurePerformed }}</div>
            <div class="record-text" *ngIf="r.treatmentPlan && !r.procedurePerformed">Plan: {{ r.treatmentPlan }}</div>
            <div class="record-row">
              <span *ngIf="r.painLevel > 0">Pain: {{ r.painLevel }}/10</span>
              <span *ngIf="r.prescriptions">Rx given</span>
              <span *ngIf="r.estimatedCost > 0">Est. {{ r.estimatedCost }} JOD</span>
            </div>
          </div>
        </div>

        <div class="panel">
          <h3>New Treatment Record</h3>
          <form (ngSubmit)="submitRecord()">
            <div class="new-record-grid">
              <div class="full-row">
                <label class="field-label">Chief Complaint</label>
                <textarea class="field-textarea" [(ngModel)]="newRecord.chiefComplaint" name="chiefComplaint"></textarea>
              </div>
              <div>
                <label class="field-label">Visit Date</label>
                <input type="date" class="field-input" [(ngModel)]="newRecord.visitDate" name="visitDate" />
              </div>
              <div>
                <label class="field-label">Pain (0–10): {{ newRecord.painLevel }}</label>
                <input type="range" min="0" max="10" class="pain-slider" [(ngModel)]="newRecord.painLevel" name="painLevel" />
              </div>
              <div class="full-row">
                <label class="field-label">Primary Diagnosis</label>
                <input class="field-input" [(ngModel)]="newRecord.primaryDiagnosis" name="primaryDiagnosis" />
              </div>
              <div>
                <label class="field-label">Procedure Performed</label>
                <textarea class="field-textarea" [(ngModel)]="newRecord.procedurePerformed" name="procedurePerformed"></textarea>
              </div>
              <div>
                <label class="field-label">Treatment Plan</label>
                <textarea class="field-textarea" [(ngModel)]="newRecord.treatmentPlan" name="treatmentPlan"></textarea>
              </div>
              <div>
                <label class="field-label">Prescriptions</label>
                <textarea class="field-textarea" [(ngModel)]="newRecord.prescriptions" name="prescriptions"></textarea>
              </div>
              <div>
                <label class="field-label">Post-Treatment Instructions</label>
                <textarea class="field-textarea" [(ngModel)]="newRecord.postTreatmentInstructions" name="instructions"></textarea>
              </div>
              <div>
                <label class="field-label">Estimated Cost (JOD)</label>
                <input type="number" min="0" class="field-input" [(ngModel)]="newRecord.estimatedCost" name="estimatedCost" />
              </div>
              <div>
                <label class="field-label">Recall (days)</label>
                <input type="number" min="0" class="field-input" [(ngModel)]="newRecord.recallPeriodDays" name="recall" />
              </div>
              <div class="full-row">
                <label class="field-label">Notes</label>
                <textarea class="field-textarea" [(ngModel)]="newRecord.notes" name="notes"></textarea>
              </div>
              <div class="full-row" style="display:flex;justify-content:flex-end;">
                <button class="btn btn-primary" type="submit" [disabled]="savingRecord">{{ savingRecord ? 'Saving…' : 'Save Treatment Record' }}</button>
              </div>
            </div>
          </form>
        </div>
      </ng-container>

      <!-- ===== Documents Tab ===== -->
      <ng-container *ngIf="activeTab === 'documents'">
        <div class="panel">
          <h3>Documents</h3>
          <div *ngIf="documents.length === 0" class="empty-line">No documents uploaded.</div>
          <div *ngFor="let d of documents" class="doc-row">
            <div>
              <div class="name">{{ d.fileName }}</div>
              <div class="doc-meta">{{ d.typeName }} · {{ formatSize(d.fileSize) }} · {{ formatDate(d.uploadedAt) }}<span *ngIf="d.uploadedBy"> · {{ d.uploadedBy }}</span></div>
              <div class="doc-meta" *ngIf="d.description">{{ d.description }}</div>
            </div>
            <a class="btn" style="background:var(--gray-100);color:var(--gray-700);text-decoration:none;" [href]="downloadUrl(d.id)" target="_blank">Download</a>
          </div>

          <div class="upload-form">
            <input type="file" #fileInput (change)="onFileChange($event)" />
            <select [(ngModel)]="upload.type">
              <option [ngValue]="0">X-Ray</option>
              <option [ngValue]="1">Prescription</option>
              <option [ngValue]="2">Photo</option>
              <option [ngValue]="3">Report</option>
              <option [ngValue]="4">Consent Form</option>
              <option [ngValue]="5">Other</option>
            </select>
            <input [(ngModel)]="upload.description" placeholder="Description (optional)" />
            <button class="btn btn-primary" [disabled]="!upload.file || uploading" (click)="uploadDoc(fileInput)">{{ uploading ? 'Uploading…' : 'Upload' }}</button>
          </div>
        </div>
      </ng-container>
    </ng-container>
  `
})
export class DoctorPatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  patientId = 0;
  loading = true;
  activeTab: 'history' | 'records' | 'documents' = 'history';

  allergies: AllergyRow[] = [];
  medications: MedicationRow[] = [];
  conditions: ConditionRow[] = [];
  records: TreatmentRecord[] = [];
  documents: DocumentRow[] = [];

  newAllergy = { allergyName: '', severity: '', notes: '' };
  newMedication = { medicationName: '', dosage: '', frequency: '', notes: '', isActive: true };
  newCondition = { conditionName: '', diagnosedDate: '', notes: '', isActive: true };

  newRecord = this.blankRecord();
  savingRecord = false;

  upload = { file: null as File | null, type: 0, description: '' };
  uploading = false;

  constructor(private route: ActivatedRoute, private api: DoctorApiService) {}

  ngOnInit(): void {
    this.patientId = parseInt(this.route.snapshot.paramMap.get('id') ?? '0', 10);
    if (!this.patientId) return;
    this.loadAll();
  }

  private loadAll(): void {
    this.loading = true;
    this.api.getPatientProfile(this.patientId).subscribe({
      next: p => { this.patient = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.refreshHistory();
    this.refreshRecords();
    this.refreshDocuments();
  }

  private refreshHistory(): void {
    this.api.getPatientMedicalHistory(this.patientId).subscribe(h => {
      this.allergies = h.allergies ?? [];
      this.medications = h.medications ?? [];
      this.conditions = h.conditions ?? [];
    });
  }

  private refreshRecords(): void {
    this.api.getPatientTreatmentRecords(this.patientId).subscribe(r => this.records = r);
  }

  private refreshDocuments(): void {
    this.api.getPatientDocuments(this.patientId).subscribe(d => this.documents = d);
  }

  // ---- Allergies ----
  addAllergy(): void {
    const payload = {
      allergyName: this.newAllergy.allergyName,
      severity: this.newAllergy.severity || undefined,
      notes: this.newAllergy.notes || undefined
    };
    this.api.addAllergy(this.patientId, payload).subscribe(() => {
      this.newAllergy = { allergyName: '', severity: '', notes: '' };
      this.refreshHistory();
    });
  }
  deleteAllergy(id: number): void {
    this.api.deleteAllergy(this.patientId, id).subscribe(() => this.refreshHistory());
  }

  // ---- Medications ----
  addMedication(): void {
    const payload = {
      medicationName: this.newMedication.medicationName,
      dosage: this.newMedication.dosage || undefined,
      frequency: this.newMedication.frequency || undefined,
      isActive: true,
      notes: this.newMedication.notes || undefined
    };
    this.api.addMedication(this.patientId, payload).subscribe(() => {
      this.newMedication = { medicationName: '', dosage: '', frequency: '', notes: '', isActive: true };
      this.refreshHistory();
    });
  }
  deleteMedication(id: number): void {
    this.api.deleteMedication(this.patientId, id).subscribe(() => this.refreshHistory());
  }

  // ---- Conditions ----
  addCondition(): void {
    const payload: any = {
      conditionName: this.newCondition.conditionName,
      isActive: true,
      notes: this.newCondition.notes || undefined
    };
    if (this.newCondition.diagnosedDate) payload.diagnosedDate = this.newCondition.diagnosedDate;
    this.api.addCondition(this.patientId, payload).subscribe(() => {
      this.newCondition = { conditionName: '', diagnosedDate: '', notes: '', isActive: true };
      this.refreshHistory();
    });
  }
  deleteCondition(id: number): void {
    this.api.deleteCondition(this.patientId, id).subscribe(() => this.refreshHistory());
  }

  // ---- Treatment record ----
  submitRecord(): void {
    this.savingRecord = true;
    const dto = { ...this.newRecord, patientId: this.patientId };
    this.api.createTreatmentRecord(dto).subscribe({
      next: () => { this.savingRecord = false; this.newRecord = this.blankRecord(); this.refreshRecords(); this.activeTab = 'records'; },
      error: () => { this.savingRecord = false; }
    });
  }

  private blankRecord() {
    return {
      patientId: 0,
      visitDate: new Date().toISOString().slice(0, 10),
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

  // ---- Documents ----
  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.upload.file = input.files?.[0] ?? null;
  }

  uploadDoc(fileInput: HTMLInputElement): void {
    if (!this.upload.file) return;
    this.uploading = true;
    this.api.uploadPatientDocument(this.patientId, this.upload.file, this.upload.type, this.upload.description || undefined).subscribe({
      next: () => {
        this.uploading = false;
        this.upload = { file: null, type: 0, description: '' };
        fileInput.value = '';
        this.refreshDocuments();
      },
      error: () => { this.uploading = false; }
    });
  }

  downloadUrl(id: number): string {
    return this.api.getDocumentDownloadUrl(id);
  }

  // ---- helpers ----
  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  formatSize(b: number): string {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
  }
}
