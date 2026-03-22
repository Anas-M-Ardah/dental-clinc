import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Invoice, InvoiceStatus } from '../../core/models/invoice.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <h2 class="mb-4">{{ 'billing.title' | translate }}</h2>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <label class="form-label">{{ 'common.status' | translate }}</label>
            <select class="form-select" [(ngModel)]="filterStatus" (change)="loadInvoices()">
              <option [ngValue]="null">{{ 'common.all' | translate }}</option>
              <option [ngValue]="0">{{ 'billing.pending' | translate }}</option>
              <option [ngValue]="1">{{ 'billing.paid' | translate }}</option>
              <option [ngValue]="2">{{ 'billing.cancelled' | translate }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="card">
      <div class="card-body">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ 'billing.invoiceNumber' | translate }}</th>
              <th>{{ 'billing.patient' | translate }}</th>
              <th>{{ 'common.date' | translate }}</th>
              <th>{{ 'billing.amount' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of invoices">
              <td>{{ inv.invoiceNumber }}</td>
              <td>{{ inv.patientName }}</td>
              <td>{{ inv.createdAt | date:'mediumDate' }}</td>
              <td>\${{ inv.totalAmount }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(inv.status)">
                  {{ getStatusText(inv.status) }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-success me-1" 
                        *ngIf="inv.status === 0"
                        (click)="payInvoice(inv.id)">{{ 'billing.pay' | translate }}</button>
                <button class="btn btn-sm btn-info" 
                        (click)="viewInvoice(inv)">{{ 'common.view' | translate }}</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="text-muted" *ngIf="!invoices.length">{{ 'billing.noInvoices' | translate }}</p>
      </div>
    </div>

    <!-- Invoice Details Modal -->
    <div class="modal d-block" *ngIf="selectedInvoice" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ 'billing.invoiceNumber' | translate }} {{ selectedInvoice.invoiceNumber }}</h5>
            <button type="button" class="btn-close" (click)="selectedInvoice = null"></button>
          </div>
          <div class="modal-body">
            <p><strong>{{ 'billing.patient' | translate }}:</strong> {{ selectedInvoice.patientName }}</p>
            <p><strong>{{ 'common.date' | translate }}:</strong> {{ selectedInvoice.createdAt | date:'medium' }}</p>
            <p><strong>{{ 'common.status' | translate }}:</strong> {{ getStatusText(selectedInvoice.status) }}</p>
            <hr>
            <h6>{{ 'billing.items' | translate }}:</h6>
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ 'appointments.treatment' | translate }}</th>
                  <th>{{ 'billing.quantity' | translate }}</th>
                  <th>{{ 'billing.unitPrice' | translate }}</th>
                  <th>{{ 'common.total' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of selectedInvoice.items">
                  <td>{{ item.treatmentName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>\${{ item.unitPrice }}</td>
                  <td>\${{ item.totalPrice }}</td>
                </tr>
              </tbody>
            </table>
            <hr>
            <h5>{{ 'billing.totalAmount' | translate }} \${{ selectedInvoice.totalAmount }}</h5>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" 
                    (click)="selectedInvoice = null">{{ 'common.close' | translate }}</button>
            <button type="button" class="btn btn-success" 
                    *ngIf="selectedInvoice.status === 0"
                    (click)="payInvoice(selectedInvoice.id)">{{ 'billing.markAsPaid' | translate }}</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BillingComponent implements OnInit {
  invoices: Invoice[] = [];
  filterStatus: InvoiceStatus | null = null;
  selectedInvoice: Invoice | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.api.getInvoices(undefined, this.filterStatus ?? undefined)
      .subscribe(result => this.invoices = result.data);
  }

  getStatusClass(status: number): string {
    const classes: { [key: number]: string } = {
      0: 'bg-warning',
      1: 'bg-success',
      2: 'bg-danger',
      3: 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusText(status: number): string {
    const texts: { [key: number]: string } = {
      0: 'Pending',
      1: 'Paid',
      2: 'Cancelled',
      3: 'Refunded'
    };
    return texts[status] || 'Unknown';
  }

  viewInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
  }

  payInvoice(id: number) {
    if (confirm(this.translate('billing.payConfirm'))) {
      this.api.payInvoice(id, { paymentMethod: 'Cash' }).subscribe(() => {
        this.loadInvoices();
        this.selectedInvoice = null;
      });
    }
  }

  private translate(key: string): string {
    const translations: { [key: string]: string } = {
      'billing.payConfirm': 'Mark this invoice as paid?'
    };
    return translations[key] || key;
  }
}
