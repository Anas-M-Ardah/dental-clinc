import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Doctor } from '../../core/models/doctor.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <h2 class="mb-4">{{ 'doctors.title' | translate }}</h2>

    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6 mb-4" *ngFor="let doctor of doctors">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Dr. {{ doctor.firstName }} {{ doctor.lastName }}</h5>
                <p class="card-text">
                  <strong>{{ 'doctors.specialization' | translate }}:</strong> {{ doctor.specialization }}<br>
                  <strong>{{ 'common.phone' | translate }}:</strong> {{ doctor.phone }}<br>
                  <strong>{{ 'common.email' | translate }}:</strong> {{ doctor.email || '-' }}
                </p>
                <span class="badge bg-success" *ngIf="doctor.isAvailable">{{ 'doctors.available' | translate }}</span>
                <span class="badge bg-danger" *ngIf="!doctor.isAvailable">{{ 'doctors.unavailable' | translate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DoctorsComponent implements OnInit {
  doctors: Doctor[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getDoctors().subscribe(data => this.doctors = data);
  }
}
