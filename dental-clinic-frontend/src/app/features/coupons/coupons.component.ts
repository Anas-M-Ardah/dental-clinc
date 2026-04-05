import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Coupon, CreateCouponDto } from '../../core/models/invoice.model';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Coupons & Discounts</h2>
      <button class="btn btn-primary" (click)="openForm()">+ New Coupon</button>
    </div>

    <!-- Coupons Table -->
    <div class="card">
      <div class="card-body" style="padding: 0;">
        <div *ngIf="loading" class="text-center py-4 text-muted">Loading...</div>
        <div class="table-responsive" *ngIf="!loading && coupons.length">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of coupons; trackBy: trackById">
                <td><span class="coupon-code">{{ c.code }}</span></td>
                <td>{{ c.description }}</td>
                <td>
                  <span *ngIf="c.isPercentage">{{ c.discountValue }}%</span>
                  <span *ngIf="!c.isPercentage">JOD {{ c.discountValue | number:'1.2-2' }}</span>
                  <span *ngIf="c.maxDiscountAmount" class="max-note"> (max JOD {{ c.maxDiscountAmount | number:'1.2-2' }})</span>
                </td>
                <td>{{ c.currentUsageCount }}{{ c.maxUsageCount ? ' / ' + c.maxUsageCount : '' }}</td>
                <td>{{ c.expiresAt ? (c.expiresAt | date:'mediumDate') : 'Never' }}</td>
                <td>
                  <span class="badge" [class.bg-success]="c.isActive" [class.bg-secondary]="!c.isActive">
                    {{ c.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-sm btn-outline-primary" (click)="editCoupon(c)">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteCoupon(c.id)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty-state" *ngIf="!loading && !coupons.length">
          <p>No coupons created yet.</p>
        </div>
      </div>
    </div>

    <!-- Coupon Form Modal -->
    <div class="modal d-block" *ngIf="showForm" style="background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);" role="dialog" aria-modal="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ editId ? 'Edit Coupon' : 'New Coupon' }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showForm = false" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Code</label>
              <input type="text" class="form-control" [(ngModel)]="form.code" placeholder="e.g. WELCOME20" style="text-transform: uppercase;">
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <input type="text" class="form-control" [(ngModel)]="form.description" placeholder="Description of the discount">
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <label class="form-label">Discount Type</label>
                <select class="form-select" [(ngModel)]="form.isPercentage">
                  <option [ngValue]="true">Percentage (%)</option>
                  <option [ngValue]="false">Fixed Amount (JOD)</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label">{{ form.isPercentage ? 'Percentage' : 'Amount' }}</label>
                <input type="number" class="form-control" [(ngModel)]="form.discountValue" min="0.01" [max]="form.isPercentage ? 100 : 99999" step="0.01">
              </div>
            </div>
            <div class="row mb-3" *ngIf="form.isPercentage">
              <div class="col-6">
                <label class="form-label">Max Discount (JOD)</label>
                <input type="number" class="form-control" [(ngModel)]="form.maxDiscountAmount" min="0" step="0.01" placeholder="Optional">
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <label class="form-label">Min Invoice Amount</label>
                <input type="number" class="form-control" [(ngModel)]="form.minInvoiceAmount" min="0" step="0.01" placeholder="Optional">
              </div>
              <div class="col-6">
                <label class="form-label">Max Usage Count</label>
                <input type="number" class="form-control" [(ngModel)]="form.maxUsageCount" min="1" placeholder="Unlimited">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Expires At</label>
              <input type="date" class="form-control" [(ngModel)]="formExpiresAt">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showForm = false">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveCoupon()" [disabled]="!form.code || !form.description || !form.discountValue">
              {{ editId ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;
    }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; }
    .coupon-code {
      font-family: 'SFMono-Regular', Consolas, monospace;
      font-size: 0.85rem; font-weight: 700; color: var(--primary);
      background: var(--primary-light, #e8f0fe); padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
    .max-note { font-size: 0.72rem; color: var(--gray-400); }
    .action-btns { display: flex; gap: 6px; }
    .empty-state { text-align: center; padding: 48px; color: var(--gray-400); }
    .row { display: flex; gap: 12px; }
    .col-6 { flex: 1; }
  `]
})
export class CouponsComponent implements OnInit, OnDestroy {
  coupons: Coupon[] = [];
  loading = false;
  showForm = false;
  editId: number | null = null;
  formExpiresAt = '';

  form: CreateCouponDto = {
    code: '', description: '', isPercentage: true,
    discountValue: 10
  };

  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadCoupons(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  trackById(index: number, item: any): number { return item.id; }

  loadCoupons() {
    this.loading = true;
    this.api.getCoupons().pipe(takeUntil(this.destroy$)).subscribe({
      next: coupons => { this.coupons = coupons; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openForm() {
    this.editId = null;
    this.form = { code: '', description: '', isPercentage: true, discountValue: 10 };
    this.formExpiresAt = '';
    this.showForm = true;
  }

  editCoupon(c: Coupon) {
    this.editId = c.id;
    this.form = {
      code: c.code, description: c.description, isPercentage: c.isPercentage,
      discountValue: c.discountValue, maxDiscountAmount: c.maxDiscountAmount ?? undefined,
      minInvoiceAmount: c.minInvoiceAmount ?? undefined,
      maxUsageCount: c.maxUsageCount ?? undefined
    };
    this.formExpiresAt = c.expiresAt ? c.expiresAt.substring(0, 10) : '';
    this.showForm = true;
  }

  saveCoupon() {
    const dto: CreateCouponDto = {
      ...this.form,
      expiresAt: this.formExpiresAt ? this.formExpiresAt + 'T23:59:59Z' : undefined
    };

    const obs = this.editId
      ? this.api.updateCoupon(this.editId, dto)
      : this.api.createCoupon(dto);

    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.showForm = false; this.loadCoupons(); }
    });
  }

  deleteCoupon(id: number) {
    if (confirm('Delete this coupon?')) {
      this.api.deleteCoupon(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.loadCoupons()
      });
    }
  }
}
