import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Patient } from '../../core/models/patient.model';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header">
      <div>
        <h2>{{ 'patients.title' | translate }}</h2>
      </div>
      <a routerLink="/patients/new" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ 'patients.addPatient' | translate }}
      </a>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" class="form-control" [placeholder]="'patients.searchPlaceholder' | translate"
             [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange($event)">
    </div>

    <!-- Patients Table -->
    <div class="card">
      <div class="card-body" style="padding: 0;">
        <div *ngIf="loading" class="text-center py-4 text-muted">{{ 'common.loading' | translate }}</div>
        <div class="table-responsive" *ngIf="!loading && patients.length">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>{{ 'common.name' | translate }}</th>
                <th>{{ 'common.phone' | translate }}</th>
                <th>{{ 'common.email' | translate }}</th>
                <th>{{ 'patients.dateOfBirth' | translate }}</th>
                <th>{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let patient of patients; trackBy: trackById">
                <td>
                  <div class="patient-name">
                    <div class="avatar">{{ patient.firstName.charAt(0) }}{{ patient.lastName.charAt(0) }}</div>
                    <span>{{ patient.firstName }} {{ patient.lastName }}</span>
                  </div>
                </td>
                <td>{{ patient.phone }}</td>
                <td>{{ patient.email || '-' }}</td>
                <td>{{ patient.dateOfBirth | date:'mediumDate' }}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-sm btn-outline-primary"
                            [routerLink]="['/patients', patient.id]">{{ 'common.edit' | translate }}</button>
                    <button class="btn btn-sm btn-outline-danger"
                            (click)="deletePatient(patient.id)">{{ 'common.delete' | translate }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="!loading && !patients.length">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="color: var(--gray-300);">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <p>{{ 'patients.noPatients' | translate }}</p>
        </div>

        <!-- Pagination -->
        <div class="pagination-wrapper" *ngIf="totalPages > 1">
          <ul class="pagination">
            <li class="page-item" [class.disabled]="pageNumber === 1">
              <a class="page-link" (click)="goToPage(pageNumber - 1)">{{ 'common.previous' | translate }}</a>
            </li>
            <li class="page-item" *ngFor="let p of pageNumbers; trackBy: trackByIndex" [class.active]="pageNumber === p">
              <a class="page-link" (click)="goToPage(p)">{{ p }}</a>
            </li>
            <li class="page-item" [class.disabled]="pageNumber === totalPages">
              <a class="page-link" (click)="goToPage(pageNumber + 1)">{{ 'common.next' | translate }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .page-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
    }
    .search-bar {
      position: relative;
      margin-bottom: 20px;
    }
    .search-bar .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-400);
      pointer-events: none;
    }
    :host-context(.rtl) .search-bar .search-icon {
      left: auto;
      right: 14px;
    }
    .search-bar .form-control {
      padding-left: 42px;
    }
    :host-context(.rtl) .search-bar .form-control {
      padding-left: 14px;
      padding-right: 42px;
    }
    .table-responsive { overflow-x: auto; }
    .patient-name {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-50) 100%);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      flex-shrink: 0;
      text-transform: uppercase;
    }
    .action-btns {
      display: flex;
      gap: 6px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      gap: 12px;
    }
    .empty-state p {
      color: var(--gray-400);
      font-weight: 500;
      margin: 0;
    }
    .pagination-wrapper {
      display: flex;
      justify-content: center;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class PatientsComponent implements OnInit, OnDestroy {
  patients: Patient[] = [];
  searchTerm = '';
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  loading = false;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  constructor(
    private api: ApiService,
    private translation: TranslationService
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageNumber = 1;
      this.loadPatients();
    });
    this.loadPatients();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  trackByIndex(index: number): number {
    return index;
  }

  loadPatients() {
    this.loading = true;
    this.api.getPatients(this.searchTerm, this.pageNumber, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.patients = result.data;
          this.totalCount = result.totalCount;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadPatients();
  }

  deletePatient(id: number) {
    if (confirm(this.translation.instant('patients.deleteConfirm'))) {
      this.api.deletePatient(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadPatients());
    }
  }
}
