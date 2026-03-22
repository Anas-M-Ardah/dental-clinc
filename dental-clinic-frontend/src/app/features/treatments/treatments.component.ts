import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Treatment } from '../../core/models/treatment.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <h2 class="mb-4">{{ 'treatments.title' | translate }}</h2>

    <div class="card">
      <div class="card-body">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ 'common.name' | translate }}</th>
              <th>{{ 'treatments.description' | translate }}</th>
              <th>{{ 'common.price' | translate }}</th>
              <th>{{ 'treatments.duration' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of treatments">
              <td>{{ t.name }}</td>
              <td>{{ t.description || '-' }}</td>
              <td>\${{ t.price }}</td>
              <td>{{ t.durationMinutes }} {{ 'treatments.minutes' | translate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TreatmentsComponent implements OnInit {
  treatments: Treatment[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getTreatments().subscribe(data => this.treatments = data);
  }
}
