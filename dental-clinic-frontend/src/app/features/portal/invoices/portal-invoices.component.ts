import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalApiService } from '../../../core/services/portal-api.service';
import { Invoice, InvoiceStatus } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-portal-invoices',
  standalone: true,
  imports: [CommonModule],
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

    .empty-state {
      text-align: center; padding: 48px; color: var(--gray-400);
      font-size: 0.85rem;
    }
    .empty-icon {
      display: flex; justify-content: center; margin-bottom: 12px;
      color: var(--gray-300);
    }
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
              <th>Status</th>
              <th>Paid On</th>
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
              <td class="amount">JOD {{ inv.totalAmount | number:'1.2-2' }}</td>
              <td>
                <span class="badge"
                  [class.badge-pending]="inv.status === 0"
                  [class.badge-paid]="inv.status === 1"
                  [class.badge-cancelled]="inv.status === 2">
                  {{ getStatusLabel(inv.status) }}
                </span>
              </td>
              <td>{{ inv.paidAt ? (inv.paidAt | date:'mediumDate') : '-' }}</td>
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
  `
})
export class PortalInvoicesComponent implements OnInit {
  invoices: Invoice[] = [];

  constructor(private portalApi: PortalApiService) {}

  ngOnInit(): void {
    this.portalApi.getMyInvoices(undefined, 1, 50).subscribe({
      next: res => { this.invoices = res.data; }
    });
  }

  getStatusLabel(status: InvoiceStatus): string {
    const labels: Record<number, string> = { 0: 'Pending', 1: 'Paid', 2: 'Cancelled', 3: 'Refunded' };
    return labels[status] ?? 'Unknown';
  }
}
