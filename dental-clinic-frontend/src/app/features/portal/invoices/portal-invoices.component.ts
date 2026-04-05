import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalApiService } from '../../../core/services/portal-api.service';
import { Invoice, InvoiceStatus } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-portal-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host { display: block; animation: pageEnter 0.35s ease-out; }
    @keyframes pageEnter {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-title {
      font-size: 1.25rem; font-weight: 700; color: var(--gray-900);
      margin: 0 0 24px; letter-spacing: -0.025em;
    }
    .card {
      background: #fff; border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xs); overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      padding: 14px 16px; text-align: left;
      background: var(--gray-50);
      font-size: 0.72rem; font-weight: 600;
      color: var(--gray-500); text-transform: uppercase;
      letter-spacing: 0.6px;
      border-bottom: 1px solid var(--border-color);
    }
    td {
      padding: 14px 16px; font-size: 0.85rem;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-100);
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--gray-50); }

    .invoice-number {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.8rem; color: var(--gray-500); font-weight: 600;
    }
    .amount {
      font-weight: 700; color: var(--gray-900);
      font-variant-numeric: tabular-nums;
    }
    .discount-note {
      font-size: 0.7rem; color: var(--success-dark); font-weight: 500;
    }
    .items-list {
      margin-top: 4px; font-size: 0.72rem; color: var(--gray-400);
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.72rem; font-weight: 600;
    }
    .badge-pending { background: var(--warning-light); color: var(--warning-dark); }
    .badge-paid { background: var(--success-light); color: var(--success-dark); }
    .badge-cancelled { background: var(--danger-light); color: var(--danger-dark); }
    .badge-refunded { background: #e0f2fe; color: #0369a1; }
    .badge-partial { background: #ede9fe; color: #6d28d9; }
    .badge-overdue { background: var(--danger-light); color: var(--danger-dark); }

    .btn-pay {
      padding: 4px 12px; border-radius: var(--radius-md);
      background: var(--success); color: white;
      border: none; font-size: 0.78rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    .btn-pay:hover { background: var(--success-dark); }
    .btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }

    .empty-state {
      text-align: center; padding: 48px; color: var(--gray-400);
      font-size: 0.85rem;
    }
    .empty-icon {
      display: flex; justify-content: center; margin-bottom: 12px;
      color: var(--gray-300);
    }

    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .modal-box {
      background: #fff; border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl); width: 400px; max-width: 90vw;
      overflow: hidden;
    }
    .modal-header {
      padding: 16px 20px; background: var(--success); color: #fff;
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
    .modal-close {
      background: none; border: none; color: #fff; font-size: 1.25rem;
      cursor: pointer; line-height: 1;
    }
    .modal-body { padding: 20px; }
    .modal-footer {
      padding: 16px 20px; border-top: 1px solid var(--border-color);
      display: flex; gap: 8px; justify-content: flex-end;
    }
    .form-label { font-size: 0.78rem; font-weight: 600; color: var(--gray-600); margin-bottom: 4px; display: block; }
    .form-control, .form-select {
      width: 100%; padding: 8px 12px; border: 1px solid var(--border-color);
      border-radius: var(--radius-md); font-size: 0.85rem;
    }
    .balance-display {
      padding: 12px 16px; background: var(--gray-50); border-radius: var(--radius-md);
      margin-bottom: 16px;
    }
    .balance-label { font-size: 0.72rem; text-transform: uppercase; color: var(--gray-500); font-weight: 600; }
    .balance-value { font-size: 1.25rem; font-weight: 800; color: var(--gray-900); }
    .btn-cancel { padding: 8px 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #fff; cursor: pointer; }
    .btn-submit {
      padding: 8px 16px; border: none; border-radius: var(--radius-md);
      background: var(--success); color: #fff; font-weight: 600; cursor: pointer;
    }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .text-danger { color: var(--danger) !important; }
    .success-msg { color: var(--success-dark); font-weight: 600; text-align: center; padding: 20px; }
  `],
  template: `
    <h1 class="page-title">My Invoices</h1>

    <div class="card">
      <ng-container *ngIf="invoices.length > 0; else emptyState">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of invoices">
              <td><span class="invoice-number">{{ inv.invoiceNumber }}</span></td>
              <td>{{ inv.createdAt | date:'mediumDate' }}</td>
              <td>
                <div *ngFor="let item of inv.items" class="items-list">
                  {{ item.treatmentName }} &times;{{ item.quantity }}
                </div>
              </td>
              <td class="amount">
                JOD {{ (inv.totalAmount - inv.discountAmount) | number:'1.2-2' }}
                <div *ngIf="inv.discountAmount > 0" class="discount-note">
                  -{{ inv.discountAmount | number:'1.2-2' }} discount
                </div>
              </td>
              <td class="amount">JOD {{ inv.paidAmount | number:'1.2-2' }}</td>
              <td class="amount" [class.text-danger]="inv.balanceDue > 0">
                JOD {{ inv.balanceDue | number:'1.2-2' }}
              </td>
              <td>
                <span class="badge" [ngClass]="getStatusBadgeClass(inv.status)">
                  {{ getStatusLabel(inv.status) }}
                </span>
              </td>
              <td>
                <button class="btn-pay"
                  *ngIf="inv.status === 0 || inv.status === 4 || inv.status === 5"
                  (click)="openPayModal(inv)">
                  Pay Now
                </button>
                <span *ngIf="inv.status === 1" style="color: var(--success); font-weight: 600; font-size: 0.8rem;">Paid</span>
              </td>
            </tr>
          </tbody>
        </table>
      </ng-container>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          No invoices found.
        </div>
      </ng-template>
    </div>

    <!-- Pay Modal -->
    <div class="modal-overlay" *ngIf="payInvoice" (click)="payInvoice = null">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Pay Invoice {{ payInvoice.invoiceNumber }}</h3>
          <button class="modal-close" (click)="payInvoice = null">&times;</button>
        </div>
        <div class="modal-body" *ngIf="!paymentSuccess">
          <div class="balance-display">
            <div class="balance-label">Balance Due</div>
            <div class="balance-value">JOD {{ payInvoice.balanceDue | number:'1.2-2' }}</div>
          </div>
          <div style="margin-bottom: 12px;">
            <label class="form-label">Payment Amount</label>
            <input type="number" class="form-control" [(ngModel)]="payAmount" [max]="payInvoice.balanceDue" min="0.01" step="0.01">
          </div>
          <div style="margin-bottom: 12px;">
            <label class="form-label">Payment Method</label>
            <select class="form-select" [(ngModel)]="payMethod">
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
        </div>
        <div class="modal-body" *ngIf="paymentSuccess">
          <div class="success-msg">
            Payment of JOD {{ payAmount | number:'1.2-2' }} processed successfully!
          </div>
        </div>
        <div class="modal-footer" *ngIf="!paymentSuccess">
          <button class="btn-cancel" (click)="payInvoice = null">Cancel</button>
          <button class="btn-submit" (click)="submitPayment()" [disabled]="!payAmount || payAmount <= 0 || payProcessing">
            {{ payProcessing ? 'Processing...' : 'Pay JOD ' + (payAmount | number:'1.2-2') }}
          </button>
        </div>
        <div class="modal-footer" *ngIf="paymentSuccess">
          <button class="btn-submit" (click)="closePayModal()">Done</button>
        </div>
      </div>
    </div>
  `
})
export class PortalInvoicesComponent implements OnInit {
  invoices: Invoice[] = [];

  payInvoice: Invoice | null = null;
  payAmount = 0;
  payMethod = 'Credit Card';
  payProcessing = false;
  paymentSuccess = false;

  constructor(private portalApi: PortalApiService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.portalApi.getMyInvoices(undefined, 1, 50).subscribe({
      next: res => { this.invoices = res.data; }
    });
  }

  getStatusLabel(status: InvoiceStatus): string {
    const labels: Record<number, string> = {
      0: 'Pending', 1: 'Paid', 2: 'Cancelled', 3: 'Refunded', 4: 'Partially Paid', 5: 'Overdue'
    };
    return labels[status] ?? 'Unknown';
  }

  getStatusBadgeClass(status: InvoiceStatus): string {
    const classes: Record<number, string> = {
      0: 'badge-pending', 1: 'badge-paid', 2: 'badge-cancelled',
      3: 'badge-refunded', 4: 'badge-partial', 5: 'badge-overdue'
    };
    return classes[status] ?? '';
  }

  openPayModal(invoice: Invoice): void {
    this.payInvoice = invoice;
    this.payAmount = invoice.balanceDue;
    this.payMethod = 'Credit Card';
    this.payProcessing = false;
    this.paymentSuccess = false;
  }

  submitPayment(): void {
    if (!this.payInvoice) return;
    this.payProcessing = true;
    this.portalApi.payInvoice(this.payInvoice.id, {
      amount: this.payAmount,
      paymentMethod: this.payMethod
    }).subscribe({
      next: () => {
        this.payProcessing = false;
        this.paymentSuccess = true;
        this.loadInvoices();
      },
      error: () => {
        this.payProcessing = false;
      }
    });
  }

  closePayModal(): void {
    this.payInvoice = null;
    this.paymentSuccess = false;
  }
}
