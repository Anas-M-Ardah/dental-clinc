import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Invoice, InvoiceStatus } from '../../core/models/invoice.model';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="page-header">
      <h2>{{ 'billing.title' | translate }}</h2>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="filter-item" style="max-width: 220px;">
        <label class="form-label">{{ 'common.status' | translate }}</label>
        <select class="form-select" [(ngModel)]="filterStatus" (change)="loadInvoices()">
          <option [ngValue]="null">{{ 'common.all' | translate }}</option>
          <option [ngValue]="0">{{ 'billing.pending' | translate }}</option>
          <option [ngValue]="1">{{ 'billing.paid' | translate }}</option>
          <option [ngValue]="2">{{ 'billing.cancelled' | translate }}</option>
        </select>
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="card">
      <div class="card-body" style="padding: 0;">
        <div *ngIf="loading" class="text-center py-4 text-muted">{{ 'common.loading' | translate }}</div>
        <div class="table-responsive" *ngIf="!loading && invoices.length">
          <table class="table mb-0">
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
              <tr *ngFor="let inv of invoices; trackBy: trackById">
                <td><span class="invoice-num">{{ inv.invoiceNumber }}</span></td>
                <td><strong>{{ inv.patientName }}</strong></td>
                <td>{{ inv.createdAt | date:'mediumDate' }}</td>
                <td class="amount-cell">\${{ inv.totalAmount | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(inv.status)">
                    {{ getStatusText(inv.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-sm btn-outline-primary"
                            (click)="viewInvoice(inv)">{{ 'common.view' | translate }}</button>
                    <button class="btn btn-sm btn-success"
                            *ngIf="inv.status === 0"
                            (click)="payInvoice(inv.id)">{{ 'billing.pay' | translate }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" *ngIf="!loading && !invoices.length">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="color: var(--gray-300);">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <p>{{ 'billing.noInvoices' | translate }}</p>
        </div>
      </div>
    </div>

    <!-- Invoice Details Modal -->
    <div class="modal d-block" *ngIf="selectedInvoice" style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);" role="dialog" aria-modal="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ 'billing.invoiceNumber' | translate }} {{ selectedInvoice.invoiceNumber }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="selectedInvoice = null" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="invoice-info-grid">
              <div class="info-item">
                <span class="info-label">{{ 'billing.patient' | translate }}</span>
                <span class="info-value">{{ selectedInvoice.patientName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ 'common.date' | translate }}</span>
                <span class="info-value">{{ selectedInvoice.createdAt | date:'medium' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ 'common.status' | translate }}</span>
                <span class="badge" [ngClass]="getStatusClass(selectedInvoice.status)">
                  {{ getStatusText(selectedInvoice.status) }}
                </span>
              </div>
            </div>
            <hr>
            <h6 class="mb-3">{{ 'billing.items' | translate }}</h6>
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
                <tr *ngFor="let item of selectedInvoice.items; trackBy: trackById">
                  <td>{{ item.treatmentName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>\${{ item.unitPrice | number:'1.2-2' }}</td>
                  <td><strong>\${{ item.totalPrice | number:'1.2-2' }}</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="invoice-total">
              <span>{{ 'billing.totalAmount' | translate }}</span>
              <span class="total-value">\${{ selectedInvoice.totalAmount | number:'1.2-2' }}</span>
            </div>
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
    .filters-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      padding: 20px 24px;
      background: #fff;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xs);
    }
    .filter-item { min-width: 0; }
    .table-responsive { overflow-x: auto; }
    .invoice-num {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.8rem;
      color: var(--gray-500);
    }
    .amount-cell {
      font-weight: 700;
      color: var(--gray-900);
      font-variant-numeric: tabular-nums;
    }
    .action-btns {
      display: flex;
      gap: 6px;
    }
    .invoice-info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--gray-400);
    }
    .info-value {
      font-weight: 600;
      color: var(--gray-800);
    }
    .invoice-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--gray-50);
      border-radius: var(--radius-md);
      margin-top: 16px;
      font-weight: 600;
      color: var(--gray-700);
    }
    .total-value {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--gray-900);
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
  `]
})
export class BillingComponent implements OnInit, OnDestroy {
  invoices: Invoice[] = [];
  filterStatus: InvoiceStatus | null = null;
  selectedInvoice: Invoice | null = null;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private translation: TranslationService
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  loadInvoices() {
    this.loading = true;
    this.api.getInvoices(undefined, this.filterStatus ?? undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => { this.invoices = result.data; this.loading = false; },
        error: () => this.loading = false
      });
  }

  getStatusClass(status: number): string {
    const classes: { [key: number]: string } = {
      0: 'bg-warning', 1: 'bg-success', 2: 'bg-danger', 3: 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusText(status: number): string {
    return this.translation.instant('invoiceStatus.' + status);
  }

  viewInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
  }

  payInvoice(id: number) {
    if (confirm(this.translation.instant('billing.payConfirm'))) {
      this.api.payInvoice(id, { paymentMethod: 'Cash' })
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadInvoices();
          this.selectedInvoice = null;
        });
    }
  }
}
