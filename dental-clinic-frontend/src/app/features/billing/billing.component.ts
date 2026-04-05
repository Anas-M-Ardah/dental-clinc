import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Invoice, InvoiceStatus, PaymentTransaction } from '../../core/models/invoice.model';
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
          <option [ngValue]="3">Refunded</option>
          <option [ngValue]="4">Partially Paid</option>
          <option [ngValue]="5">Overdue</option>
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
                <th>Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>{{ 'common.status' | translate }}</th>
                <th>{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inv of invoices; trackBy: trackById">
                <td><span class="invoice-num">{{ inv.invoiceNumber }}</span></td>
                <td><strong>{{ inv.patientName }}</strong></td>
                <td>{{ inv.createdAt | date:'mediumDate' }}</td>
                <td class="amount-cell">
                  JOD {{ (inv.totalAmount - inv.discountAmount) | number:'1.2-2' }}
                  <div *ngIf="inv.discountAmount > 0" class="discount-tag">
                    -{{ inv.discountAmount | number:'1.2-2' }} discount
                    <span *ngIf="inv.couponCode">({{ inv.couponCode }})</span>
                  </div>
                </td>
                <td class="amount-cell">JOD {{ inv.paidAmount | number:'1.2-2' }}</td>
                <td class="amount-cell" [class.text-danger]="inv.balanceDue > 0">
                  JOD {{ inv.balanceDue | number:'1.2-2' }}
                </td>
                <td>{{ inv.dueDate ? (inv.dueDate | date:'mediumDate') : '-' }}</td>
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
                            *ngIf="inv.status === 0 || inv.status === 4 || inv.status === 5"
                            (click)="openPaymentModal(inv)">Pay</button>
                    <button class="btn btn-sm btn-outline-danger"
                            *ngIf="inv.paidAmount > 0 && inv.status !== 2"
                            (click)="openRefundModal(inv)">Refund</button>
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
      <div class="modal-dialog modal-lg">
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
              <div class="info-item" *ngIf="selectedInvoice.dueDate">
                <span class="info-label">Due Date</span>
                <span class="info-value">{{ selectedInvoice.dueDate | date:'mediumDate' }}</span>
              </div>
              <div class="info-item" *ngIf="selectedInvoice.couponCode">
                <span class="info-label">Coupon</span>
                <span class="info-value">{{ selectedInvoice.couponCode }}</span>
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
                  <td>JOD {{ item.unitPrice | number:'1.2-2' }}</td>
                  <td><strong>JOD {{ item.totalPrice | number:'1.2-2' }}</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="invoice-summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>JOD {{ selectedInvoice.totalAmount | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row text-success" *ngIf="selectedInvoice.discountAmount > 0">
                <span>Discount <span *ngIf="selectedInvoice.couponCode">({{ selectedInvoice.couponCode }})</span></span>
                <span>-JOD {{ selectedInvoice.discountAmount | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row summary-total">
                <span>Net Total</span>
                <span>JOD {{ (selectedInvoice.totalAmount - selectedInvoice.discountAmount) | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Paid</span>
                <span>JOD {{ selectedInvoice.paidAmount | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row" [class.text-danger]="selectedInvoice.balanceDue > 0">
                <span>Balance Due</span>
                <span class="total-value">JOD {{ selectedInvoice.balanceDue | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Payment History -->
            <div *ngIf="selectedInvoice.payments && selectedInvoice.payments.length > 0" class="mt-4">
              <h6 class="mb-3">Payment History</h6>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of selectedInvoice.payments">
                    <td>{{ p.createdAt | date:'medium' }}</td>
                    <td><span class="invoice-num">{{ p.transactionId }}</span></td>
                    <td>{{ p.paymentMethod }}</td>
                    <td [class.text-danger]="p.amount < 0" [class.text-success]="p.amount > 0">
                      {{ p.amount > 0 ? '+' : '' }}JOD {{ p.amount | number:'1.2-2' }}
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getPaymentStatusClass(p.status)">
                        {{ getPaymentStatusText(p.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary"
                    (click)="selectedInvoice = null">{{ 'common.close' | translate }}</button>
            <button type="button" class="btn btn-success"
                    *ngIf="selectedInvoice.status === 0 || selectedInvoice.status === 4 || selectedInvoice.status === 5"
                    (click)="openPaymentModal(selectedInvoice)">Make Payment</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div class="modal d-block" *ngIf="paymentInvoice" style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);" role="dialog" aria-modal="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">Make Payment - {{ paymentInvoice.invoiceNumber }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="paymentInvoice = null" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <span class="info-label">Balance Due</span>
              <span class="total-value d-block">JOD {{ paymentInvoice.balanceDue | number:'1.2-2' }}</span>
            </div>
            <div class="mb-3">
              <label class="form-label">Amount</label>
              <input type="number" class="form-control" [(ngModel)]="paymentAmount" [max]="paymentInvoice.balanceDue" min="0.01" step="0.01">
            </div>
            <div class="mb-3">
              <label class="form-label">Payment Method</label>
              <select class="form-select" [(ngModel)]="paymentMethod">
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Notes (optional)</label>
              <input type="text" class="form-control" [(ngModel)]="paymentNotes">
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-success flex-fill" (click)="paymentAmount = paymentInvoice.balanceDue">Pay Full Balance</button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="paymentInvoice = null">Cancel</button>
            <button type="button" class="btn btn-success" (click)="submitPayment()" [disabled]="!paymentAmount || paymentAmount <= 0">
              Pay JOD {{ paymentAmount | number:'1.2-2' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Refund Modal -->
    <div class="modal d-block" *ngIf="refundInvoice" style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);" role="dialog" aria-modal="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Refund - {{ refundInvoice.invoiceNumber }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="refundInvoice = null" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <span class="info-label">Paid Amount</span>
              <span class="total-value d-block">JOD {{ refundInvoice.paidAmount | number:'1.2-2' }}</span>
            </div>
            <div class="mb-3">
              <label class="form-label">Refund Amount</label>
              <input type="number" class="form-control" [(ngModel)]="refundAmount" [max]="refundInvoice.paidAmount" min="0.01" step="0.01">
            </div>
            <div class="mb-3">
              <label class="form-label">Reason</label>
              <input type="text" class="form-control" [(ngModel)]="refundReason">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="refundInvoice = null">Cancel</button>
            <button type="button" class="btn btn-danger" (click)="submitRefund()" [disabled]="!refundAmount || refundAmount <= 0">
              Refund JOD {{ refundAmount | number:'1.2-2' }}
            </button>
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
    .discount-tag {
      font-size: 0.7rem;
      color: var(--success-dark);
      font-weight: 500;
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
    .invoice-summary {
      padding: 16px 20px;
      background: var(--gray-50);
      border-radius: var(--radius-md);
      margin-top: 16px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-weight: 500;
      color: var(--gray-600);
    }
    .summary-total {
      border-top: 1px solid var(--border-color);
      padding-top: 10px;
      margin-top: 4px;
      font-weight: 700;
      color: var(--gray-900);
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
    .text-danger { color: var(--danger) !important; }
    .text-success { color: var(--success) !important; }
  `]
})
export class BillingComponent implements OnInit, OnDestroy {
  invoices: Invoice[] = [];
  filterStatus: InvoiceStatus | null = null;
  selectedInvoice: Invoice | null = null;
  loading = false;
  private destroy$ = new Subject<void>();

  // Payment modal
  paymentInvoice: Invoice | null = null;
  paymentAmount = 0;
  paymentMethod = 'Cash';
  paymentNotes = '';

  // Refund modal
  refundInvoice: Invoice | null = null;
  refundAmount = 0;
  refundReason = '';

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
      0: 'bg-warning', 1: 'bg-success', 2: 'bg-danger', 3: 'bg-info', 4: 'bg-primary', 5: 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusText(status: number): string {
    const labels: { [key: number]: string } = {
      0: 'Pending', 1: 'Paid', 2: 'Cancelled', 3: 'Refunded', 4: 'Partially Paid', 5: 'Overdue'
    };
    return labels[status] || 'Unknown';
  }

  getPaymentStatusClass(status: number): string {
    const classes: { [key: number]: string } = {
      0: 'bg-warning', 1: 'bg-success', 2: 'bg-danger', 3: 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  getPaymentStatusText(status: number): string {
    const labels: { [key: number]: string } = {
      0: 'Pending', 1: 'Completed', 2: 'Failed', 3: 'Refunded'
    };
    return labels[status] || 'Unknown';
  }

  viewInvoice(invoice: Invoice) {
    this.api.getInvoice(invoice.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: full => this.selectedInvoice = full
    });
  }

  openPaymentModal(invoice: Invoice) {
    this.paymentInvoice = invoice;
    this.paymentAmount = invoice.balanceDue;
    this.paymentMethod = 'Cash';
    this.paymentNotes = '';
    this.selectedInvoice = null;
  }

  submitPayment() {
    if (!this.paymentInvoice) return;
    this.api.makePayment(this.paymentInvoice.id, {
      amount: this.paymentAmount,
      paymentMethod: this.paymentMethod,
      notes: this.paymentNotes || undefined
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.paymentInvoice = null;
        this.loadInvoices();
      }
    });
  }

  openRefundModal(invoice: Invoice) {
    this.refundInvoice = invoice;
    this.refundAmount = invoice.paidAmount;
    this.refundReason = '';
    this.selectedInvoice = null;
  }

  submitRefund() {
    if (!this.refundInvoice) return;
    this.api.refundPayment(this.refundInvoice.id, {
      amount: this.refundAmount,
      reason: this.refundReason || undefined
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.refundInvoice = null;
        this.loadInvoices();
      }
    });
  }

  // Keep old method for backwards compat
  payInvoice(id: number) {
    const inv = this.invoices.find(i => i.id === id);
    if (inv) this.openPaymentModal(inv);
  }
}
