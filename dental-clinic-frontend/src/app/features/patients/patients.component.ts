import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, PagedResult } from '../../core/services/api.service';
import { Patient } from '../../core/models/patient.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>{{ 'patients.title' | translate }}</h2>
      <a routerLink="/patients/new" class="btn btn-primary">{{ 'patients.addPatient' | translate }}</a>
    </div>

    <!-- Search -->
    <div class="mb-3">
      <input type="text" class="form-control" [placeholder]="'patients.searchPlaceholder' | translate" 
             [(ngModel)]="searchTerm" (input)="onSearch()">
    </div>

    <!-- Patients Table -->
    <div class="card">
      <div class="card-body">
        <table class="table table-hover">
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
            <tr *ngFor="let patient of patients">
              <td>{{ patient.firstName }} {{ patient.lastName }}</td>
              <td>{{ patient.phone }}</td>
              <td>{{ patient.email || '-' }}</td>
              <td>{{ patient.dateOfBirth | date:'mediumDate' }}</td>
              <td>
                <button class="btn btn-sm btn-primary me-1" 
                        [routerLink]="['/patients', patient.id]">{{ 'common.view' | translate }}</button>
                <button class="btn btn-sm btn-danger" 
                        (click)="deletePatient(patient.id)">{{ 'common.delete' | translate }}</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Pagination -->
        <nav *ngIf="totalPages > 1">
          <ul class="pagination">
            <li class="page-item" [class.disabled]="pageNumber === 1">
              <a class="page-link" (click)="goToPage(pageNumber - 1)">{{ 'common.previous' | translate }}</a>
            </li>
            <li class="page-item" *ngFor="let p of [].constructor(totalPages); let i = index">
              <a class="page-link" (click)="goToPage(i + 1)" [class.active]="pageNumber === i + 1">
                {{ i + 1 }}
              </a>
            </li>
            <li class="page-item" [class.disabled]="pageNumber === totalPages">
              <a class="page-link" (click)="goToPage(pageNumber + 1)">{{ 'common.next' | translate }}</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  `
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  searchTerm = '';
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.api.getPatients(this.searchTerm, this.pageNumber, this.pageSize)
      .subscribe(result => {
        this.patients = result.data;
        this.totalCount = result.totalCount;
      });
  }

  onSearch() {
    this.pageNumber = 1;
    this.loadPatients();
  }

  goToPage(page: number) {
    this.pageNumber = page;
    this.loadPatients();
  }

  deletePatient(id: number) {
    if (confirm(this.translate('patients.deleteConfirm'))) {
      this.api.deletePatient(id).subscribe(() => this.loadPatients());
    }
  }

  private translate(key: string): string {
    const translations: { [key: string]: string } = {
      'patients.deleteConfirm': 'Are you sure you want to delete this patient?'
    };
    return translations[key] || key;
  }
}
