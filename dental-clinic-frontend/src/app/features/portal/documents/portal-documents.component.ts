import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PortalApiService } from '../../../core/services/portal-api.service';

@Component({
  selector: 'app-portal-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>My Documents</h2>
    </div>

    <div class="empty-state" *ngIf="loaded && documents.length === 0">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
      <p>No documents uploaded yet.</p>
      <p class="sub-text">Your clinic will upload documents like X-rays, prescriptions, and photos here.</p>
    </div>

    <!-- Group by type -->
    <div *ngFor="let group of groupedDocuments" class="doc-group">
      <h3 class="group-title">
        <span class="group-badge" [ngClass]="'badge-' + group.typeName.toLowerCase()">{{ group.typeName }}</span>
        <span class="group-count">{{ group.docs.length }} file{{ group.docs.length !== 1 ? 's' : '' }}</span>
      </h3>
      <div class="doc-grid">
        <div class="doc-card" *ngFor="let doc of group.docs">
          <div class="doc-card-icon" [ngClass]="getIconClass(doc.contentType)">
            <span *ngIf="doc.contentType.startsWith('image/')">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </span>
            <span *ngIf="doc.contentType === 'application/pdf'">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </span>
            <span *ngIf="!doc.contentType.startsWith('image/') && doc.contentType !== 'application/pdf'">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </span>
          </div>
          <div class="doc-card-body">
            <div class="doc-card-name">{{ doc.fileName }}</div>
            <div class="doc-card-meta">
              {{ formatFileSize(doc.fileSize) }}
              <span *ngIf="doc.version > 1"> &middot; v{{ doc.version }}</span>
              &middot; {{ doc.uploadedAt | date:'mediumDate' }}
            </div>
            <div class="doc-card-desc" *ngIf="doc.description">{{ doc.description }}</div>
          </div>
          <a class="doc-download-btn" [href]="portalApi.getDocumentDownloadUrl(doc.id)" target="_blank" title="Download">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 28px; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; }

    .empty-state { text-align: center; padding: 60px 20px; color: var(--gray-400); }
    .empty-state svg { margin-bottom: 12px; opacity: 0.4; }
    .empty-state p { font-size: 0.9rem; margin: 4px 0; }
    .empty-state .sub-text { font-size: 0.8rem; color: var(--gray-300); }

    .doc-group { margin-bottom: 32px; }
    .group-title { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .group-badge {
      display: inline-block; padding: 4px 12px; border-radius: var(--radius-full);
      font-size: 0.78rem; font-weight: 700;
    }
    .badge-xray { background: #ede9fe; color: #7c3aed; }
    .badge-prescription { background: #d1fae5; color: #059669; }
    .badge-beforephoto { background: #fef3c7; color: #d97706; }
    .badge-afterphoto { background: #cffafe; color: #0891b2; }
    .badge-labreport { background: #fee2e2; color: #dc2626; }
    .badge-other { background: var(--gray-100); color: var(--gray-600); }
    .group-count { font-size: 0.78rem; color: var(--gray-400); font-weight: 500; }

    .doc-grid { display: flex; flex-direction: column; gap: 8px; }

    .doc-card {
      display: flex; align-items: center; gap: 16px;
      background: #fff; border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 16px 20px;
      transition: all 0.2s; box-shadow: var(--shadow-xs);
    }
    .doc-card:hover { border-color: var(--primary-200, #c7d2fe); box-shadow: var(--shadow-sm); }

    .doc-card-icon {
      width: 48px; height: 48px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      background: var(--gray-100); color: var(--gray-500);
    }
    .doc-card-icon.icon-image { background: #dbeafe; color: #2563eb; }
    .doc-card-icon.icon-pdf { background: #fee2e2; color: #dc2626; }
    .doc-card-icon.icon-doc { background: #dbeafe; color: #1d4ed8; }

    .doc-card-body { flex: 1; min-width: 0; }
    .doc-card-name { font-weight: 700; font-size: 0.9rem; color: var(--gray-900); word-break: break-all; }
    .doc-card-meta { font-size: 0.78rem; color: var(--gray-400); margin-top: 2px; }
    .doc-card-desc { font-size: 0.8rem; color: var(--gray-500); margin-top: 4px; }

    .doc-download-btn {
      width: 40px; height: 40px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      background: var(--gray-50); border: 1px solid var(--border-color);
      color: var(--gray-500); transition: all 0.2s; text-decoration: none;
    }
    .doc-download-btn:hover {
      background: var(--primary-light, #eef2ff); border-color: var(--primary-200, #c7d2fe);
      color: var(--primary);
    }
  `]
})
export class PortalDocumentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  documents: any[] = [];
  groupedDocuments: { typeName: string; docs: any[] }[] = [];
  loaded = false;

  constructor(public portalApi: PortalApiService) {}

  ngOnInit() {
    this.portalApi.getMyDocuments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: docs => {
          this.documents = docs;
          this.groupDocuments();
          this.loaded = true;
        },
        error: () => { this.loaded = true; }
      });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  private groupDocuments() {
    const groups: Record<string, any[]> = {};
    for (const doc of this.documents) {
      const key = doc.typeName || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    }
    this.groupedDocuments = Object.entries(groups).map(([typeName, docs]) => ({ typeName, docs }));
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getIconClass(contentType: string): string {
    if (contentType.startsWith('image/')) return 'icon-image';
    if (contentType === 'application/pdf') return 'icon-pdf';
    if (contentType.includes('word')) return 'icon-doc';
    return '';
  }
}
