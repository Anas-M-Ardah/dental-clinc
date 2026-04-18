import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

interface DocumentDto {
  id: number;
  patientId: number;
  patientName: string;
  treatmentRecordId: number | null;
  fileName: string;
  contentType: string;
  fileSize: number;
  type: number;
  typeName: string;
  description: string | null;
  version: number;
  isArchived: boolean;
  uploadedAt: string;
  uploadedBy: string | null;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Document Management</h2>
      <button class="btn btn-primary" (click)="showUploadModal = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        Upload Document
      </button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <input type="number" class="form-control" placeholder="Enter Patient ID to search..." [(ngModel)]="searchPatientId" min="1">
      <button class="btn btn-primary" (click)="loadDocuments()" [disabled]="!searchPatientId">Search</button>
    </div>

    <!-- Status message -->
    <div class="empty-state" *ngIf="!searchPatientId && documents.length === 0">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
      <p>Enter a Patient ID to view their documents</p>
    </div>

    <div class="empty-state" *ngIf="searched && documents.length === 0">
      <p>No documents found for this patient.</p>
    </div>

    <!-- Documents Table -->
    <div class="card" *ngIf="documents.length > 0">
      <div class="card-header">
        <h3>Documents for {{ documents[0].patientName }} (ID: {{ searchPatientId }})</h3>
        <span class="doc-count">{{ documents.length }} file{{ documents.length !== 1 ? 's' : '' }}</span>
      </div>
      <div class="card-body" style="padding: 0">
        <table class="table mb-0">
          <thead>
            <tr>
              <th>File</th>
              <th>Type</th>
              <th>Size</th>
              <th>Version</th>
              <th>Uploaded</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of documents">
              <td>
                <div class="file-info">
                  <span class="file-icon" [ngClass]="getFileIconClass(doc.contentType)">
                    {{ getFileExtension(doc.fileName) }}
                  </span>
                  <span class="file-name">{{ doc.fileName }}</span>
                </div>
              </td>
              <td><span class="badge" [ngClass]="'badge-' + doc.typeName.toLowerCase()">{{ doc.typeName }}</span></td>
              <td>{{ formatFileSize(doc.fileSize) }}</td>
              <td>v{{ doc.version }}</td>
              <td>{{ doc.uploadedAt | date:'short' }}</td>
              <td class="desc-cell">{{ doc.description || '-' }}</td>
              <td>
                <div class="action-btns">
                  <a class="btn btn-sm btn-outline-primary" [href]="api.getDocumentDownloadUrl(doc.id)" target="_blank" title="Download">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </a>
                  <button class="btn btn-sm btn-outline-warning" (click)="archiveDocument(doc)" title="Archive">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                    </svg>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteDocument(doc)" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Upload Modal -->
    <div class="modal-backdrop" *ngIf="showUploadModal" (click)="closeUploadModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Upload Document</h3>
          <button class="close-btn" (click)="closeUploadModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Patient ID *</label>
            <input type="number" class="form-control" [(ngModel)]="uploadForm.patientId" min="1">
          </div>
          <div class="form-group">
            <label>Treatment Record ID (optional)</label>
            <input type="number" class="form-control" [(ngModel)]="uploadForm.treatmentRecordId" min="1">
          </div>
          <div class="form-group">
            <label>Document Type *</label>
            <select class="form-control" [(ngModel)]="uploadForm.type">
              <option [value]="0">X-Ray</option>
              <option [value]="1">Prescription</option>
              <option [value]="2">Before Photo</option>
              <option [value]="3">After Photo</option>
              <option [value]="4">Lab Report</option>
              <option [value]="5">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" class="form-control" [(ngModel)]="uploadForm.description" maxlength="500" placeholder="Optional description...">
          </div>
          <div class="form-group">
            <label>File * (max 10 MB)</label>
            <div class="file-drop-zone" [class.has-file]="selectedFile"
              (dragover)="$event.preventDefault()" (drop)="onFileDrop($event)">
              <input type="file" #fileInput (change)="onFileSelected($event)" accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf,.doc,.docx" style="display:none">
              <div *ngIf="!selectedFile" class="drop-placeholder" (click)="fileInput.click()">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>Click or drag file here</span>
                <span class="file-types">JPG, PNG, GIF, WEBP, BMP, PDF, DOC, DOCX</span>
              </div>
              <div *ngIf="selectedFile" class="selected-file" (click)="fileInput.click()">
                <span class="file-icon file-icon-lg">{{ getFileExtension(selectedFile.name) }}</span>
                <div>
                  <div class="selected-file-name">{{ selectedFile.name }}</div>
                  <div class="selected-file-size">{{ formatFileSize(selectedFile.size) }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="upload-error" *ngIf="uploadError">{{ uploadError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeUploadModal()">Cancel</button>
          <button class="btn btn-primary" (click)="upload()" [disabled]="uploading || !canUpload()">
            {{ uploading ? 'Uploading...' : 'Upload' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; }
    .page-header .btn { display: flex; align-items: center; gap: 8px; }

    .search-bar { display: flex; gap: 8px; margin-bottom: 24px; }
    .search-bar .form-control { max-width: 300px; }

    .empty-state { text-align: center; padding: 60px 20px; color: var(--gray-400); }
    .empty-state svg { margin-bottom: 12px; opacity: 0.4; }
    .empty-state p { font-size: 0.9rem; }

    .card { background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-xs); overflow: hidden; }
    .card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-color); }
    .card-header h3 { margin: 0; font-size: 0.95rem; font-weight: 700; }
    .doc-count { font-size: 0.8rem; color: var(--gray-400); font-weight: 600; }

    .file-info { display: flex; align-items: center; gap: 10px; }
    .file-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: var(--radius-md);
      font-size: 0.6rem; font-weight: 800; text-transform: uppercase;
      background: var(--gray-100); color: var(--gray-500); flex-shrink: 0;
    }
    .file-icon-lg { width: 48px; height: 48px; font-size: 0.7rem; }
    .file-icon.icon-image { background: #dbeafe; color: #2563eb; }
    .file-icon.icon-pdf { background: #fee2e2; color: #dc2626; }
    .file-icon.icon-doc { background: #dbeafe; color: #1d4ed8; }
    .file-name { font-weight: 600; font-size: 0.85rem; word-break: break-all; }

    .badge {
      display: inline-block; padding: 3px 10px; border-radius: var(--radius-full);
      font-size: 0.72rem; font-weight: 600;
    }
    .badge-xray { background: #ede9fe; color: #7c3aed; }
    .badge-prescription { background: #d1fae5; color: #059669; }
    .badge-beforephoto { background: #fef3c7; color: #d97706; }
    .badge-afterphoto { background: #cffafe; color: #0891b2; }
    .badge-labreport { background: #fee2e2; color: #dc2626; }
    .badge-other { background: var(--gray-100); color: var(--gray-600); }

    .desc-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.82rem; color: var(--gray-500); }

    .action-btns { display: flex; gap: 6px; }
    .action-btns .btn { padding: 4px 8px; }

    /* Modal */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 2000; animation: fadeIn 0.15s ease;
    }
    .modal-content {
      background: #fff; border-radius: var(--radius-xl, 12px); width: 520px; max-width: 90vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: slideUp 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; border-bottom: 1px solid var(--border-color);
    }
    .modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: var(--gray-400); cursor: pointer; line-height: 1; }
    .close-btn:hover { color: var(--gray-700); }
    .modal-body { padding: 24px; }
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 8px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }

    .file-drop-zone {
      border: 2px dashed var(--border-color); border-radius: var(--radius-lg);
      padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s;
    }
    .file-drop-zone:hover, .file-drop-zone.has-file { border-color: var(--primary); background: rgba(var(--primary-rgb), 0.02); }
    .drop-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--gray-400); }
    .drop-placeholder svg { opacity: 0.5; }
    .drop-placeholder span { font-size: 0.85rem; }
    .file-types { font-size: 0.72rem; color: var(--gray-300); }
    .selected-file { display: flex; align-items: center; gap: 14px; }
    .selected-file-name { font-weight: 600; font-size: 0.9rem; }
    .selected-file-size { font-size: 0.78rem; color: var(--gray-400); }
    .upload-error { color: var(--danger, #ef4444); font-size: 0.82rem; margin-top: 8px; font-weight: 600; }
  `]
})
export class DocumentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  documents: DocumentDto[] = [];
  searchPatientId: number | null = null;
  searched = false;

  showUploadModal = false;
  uploading = false;
  uploadError = '';
  selectedFile: File | null = null;
  uploadForm = {
    patientId: null as number | null,
    treatmentRecordId: null as number | null,
    type: 0,
    description: ''
  };

  constructor(public api: ApiService) {}

  ngOnInit() {}
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  loadDocuments() {
    if (!this.searchPatientId) return;
    this.api.getDocumentsByPatient(this.searchPatientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: docs => {
          this.documents = docs;
          this.searched = true;
        },
        error: () => {
          this.documents = [];
          this.searched = true;
        }
      });
  }

  archiveDocument(doc: DocumentDto) {
    if (!confirm(`Archive "${doc.fileName}"?`)) return;
    this.api.archiveDocument(doc.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadDocuments());
  }

  deleteDocument(doc: DocumentDto) {
    if (!confirm(`Permanently delete "${doc.fileName}"? This cannot be undone.`)) return;
    this.api.deleteDocument(doc.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadDocuments());
  }

  // Upload
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files?.length) this.selectedFile = event.dataTransfer.files[0];
  }

  canUpload(): boolean {
    return !!this.uploadForm.patientId && !!this.selectedFile;
  }

  upload() {
    if (!this.canUpload() || !this.selectedFile) return;
    this.uploading = true;
    this.uploadError = '';

    const formData = new FormData();
    formData.append('patientId', String(this.uploadForm.patientId));
    if (this.uploadForm.treatmentRecordId) {
      formData.append('treatmentRecordId', String(this.uploadForm.treatmentRecordId));
    }
    formData.append('type', String(this.uploadForm.type));
    if (this.uploadForm.description) {
      formData.append('description', this.uploadForm.description);
    }
    formData.append('file', this.selectedFile);

    this.api.uploadDocument(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.uploading = false;
          this.closeUploadModal();
          if (this.uploadForm.patientId === this.searchPatientId) {
            this.loadDocuments();
          } else {
            this.searchPatientId = this.uploadForm.patientId;
            this.loadDocuments();
          }
        },
        error: (err: any) => {
          this.uploading = false;
          this.uploadError = err.error?.message || err.error || 'Upload failed. Check file type and size.';
        }
      });
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.uploadError = '';
    this.uploadForm = { patientId: null, treatmentRecordId: null, type: 0, description: '' };
  }

  // Helpers
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileExtension(name: string): string {
    return name.split('.').pop()?.toUpperCase() || '?';
  }

  getFileIconClass(contentType: string): string {
    if (contentType.startsWith('image/')) return 'icon-image';
    if (contentType === 'application/pdf') return 'icon-pdf';
    if (contentType.includes('word')) return 'icon-doc';
    return '';
  }
}
