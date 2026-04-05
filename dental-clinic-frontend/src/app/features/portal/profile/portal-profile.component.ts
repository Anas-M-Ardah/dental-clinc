import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortalApiService } from '../../../core/services/portal-api.service';
import { Patient } from '../../../core/models/patient.model';

@Component({
  selector: 'app-portal-profile',
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
      box-shadow: var(--shadow-sm);
      padding: 32px; max-width: 560px;
    }

    .form-group { margin-bottom: 18px; }
    .form-label {
      display: block; font-size: 0.82rem; font-weight: 500;
      color: var(--gray-700); margin-bottom: 7px;
    }
    .form-control {
      width: 100%; padding: 11px 14px;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 0.85rem; color: var(--gray-800);
      box-sizing: border-box;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      outline: none; font-family: inherit;
    }
    .form-control::placeholder { color: var(--gray-400); }
    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    .form-control[disabled] {
      background: var(--gray-50); color: var(--gray-400);
      cursor: not-allowed; border-color: var(--gray-200);
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .readonly-note {
      font-size: 0.72rem; color: var(--gray-400); margin-top: 5px;
    }

    .divider {
      height: 1px; background: var(--border-color);
      margin: 24px 0;
    }

    .btn-save {
      padding: 11px 28px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-500) 100%);
      color: #fff; border: none;
      border-radius: var(--radius-md);
      font-size: 0.85rem; font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: inherit;
      box-shadow: 0 1px 3px rgba(var(--primary-rgb), 0.2);
      margin-top: 8px;
    }
    .btn-save:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      transform: translateY(-1px);
      box-shadow: var(--shadow-primary);
    }
    .btn-save:disabled {
      opacity: 0.55; cursor: not-allowed;
      transform: none; box-shadow: none;
    }

    .success-msg {
      color: var(--success); font-size: 0.85rem; margin-top: 14px;
      display: flex; align-items: center; gap: 6px;
    }
    .error-msg {
      color: var(--danger); font-size: 0.85rem; margin-top: 14px;
      padding: 10px; background: var(--danger-light);
      border-radius: var(--radius-sm);
    }

    .section-title {
      font-size: 1rem; font-weight: 700; color: var(--gray-900);
      margin: 0 0 16px; letter-spacing: -0.01em;
    }
    .toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 0; border-bottom: 1px solid var(--border-light);
    }
    .toggle-row:last-child { border-bottom: none; }
    .toggle-label { font-size: 0.85rem; color: var(--gray-700); font-weight: 500; }
    .toggle-desc { font-size: 0.75rem; color: var(--gray-400); margin-top: 2px; }
    .toggle-switch {
      position: relative; width: 44px; height: 24px; cursor: pointer;
    }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: var(--gray-300); border-radius: 24px;
      transition: background var(--transition-fast);
    }
    .toggle-slider::before {
      content: ''; position: absolute;
      height: 18px; width: 18px; left: 3px; bottom: 3px;
      background: #fff; border-radius: 50%;
      transition: transform var(--transition-fast);
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .toggle-switch input:checked + .toggle-slider {
      background: var(--primary);
    }
    .toggle-switch input:checked + .toggle-slider::before {
      transform: translateX(20px);
    }
  `],
  template: `
    <h1 class="page-title">My Profile</h1>

    <div class="card" *ngIf="patient">
      <form (ngSubmit)="save()" #profileForm="ngForm">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">First name</label>
            <input type="text" class="form-control" name="firstName" [(ngModel)]="dto.firstName" required />
          </div>
          <div class="form-group">
            <label class="form-label">Last name</label>
            <input type="text" class="form-control" name="lastName" [(ngModel)]="dto.lastName" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email address</label>
          <input type="email" class="form-control" [value]="patient.email" disabled />
          <div class="readonly-note">Email cannot be changed from the portal.</div>
        </div>

        <div class="divider"></div>

        <div class="form-group">
          <label class="form-label">Phone</label>
          <input type="tel" class="form-control" name="phone" [(ngModel)]="dto.phone" required />
        </div>

        <div class="form-group">
          <label class="form-label">Address</label>
          <input type="text" class="form-control" name="address" [(ngModel)]="dto.address" placeholder="Enter your address" />
        </div>

        <button type="submit" class="btn-save" [disabled]="saving || !profileForm.valid">
          {{ saving ? 'Saving...' : 'Save changes' }}
        </button>

        <div class="success-msg" *ngIf="successMsg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ successMsg }}
        </div>
        <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
      </form>

      <div class="divider"></div>

      <h3 class="section-title">Notification Preferences</h3>
      <div class="toggle-row">
        <div>
          <div class="toggle-label">Email Notifications</div>
          <div class="toggle-desc">Receive appointment confirmations, invoices, and payment receipts via email</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" [checked]="patient.emailNotificationsEnabled" (change)="toggleEmailNotifications()">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="toggle-row">
        <div>
          <div class="toggle-label">SMS Notifications</div>
          <div class="toggle-desc">Receive appointment reminders via text message</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" [checked]="patient.smsNotificationsEnabled" (change)="toggleSmsNotifications()">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  `
})
export class PortalProfileComponent implements OnInit {
  patient: Patient | null = null;
  dto = { firstName: '', lastName: '', phone: '', address: '' };
  saving = false;
  successMsg = '';
  errorMsg = '';

  constructor(private portalApi: PortalApiService) {}

  ngOnInit(): void {
    this.portalApi.getProfile().subscribe({
      next: p => {
        this.patient = p;
        this.dto = {
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone,
          address: p.address ?? ''
        };
      }
    });
  }

  save(): void {
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.portalApi.updateProfile(this.dto).subscribe({
      next: p => {
        this.patient = p;
        this.saving = false;
        this.successMsg = 'Profile updated successfully.';
        setTimeout(() => { this.successMsg = ''; }, 3000);
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Failed to update profile. Please try again.';
      }
    });
  }

  toggleEmailNotifications(): void {
    if (!this.patient) return;
    const newVal = !this.patient.emailNotificationsEnabled;
    this.portalApi.updateNotificationPreferences({
      emailNotificationsEnabled: newVal,
      smsNotificationsEnabled: this.patient.smsNotificationsEnabled
    }).subscribe({
      next: p => this.patient = p,
      error: () => {}
    });
  }

  toggleSmsNotifications(): void {
    if (!this.patient) return;
    const newVal = !this.patient.smsNotificationsEnabled;
    this.portalApi.updateNotificationPreferences({
      emailNotificationsEnabled: this.patient.emailNotificationsEnabled,
      smsNotificationsEnabled: newVal
    }).subscribe({
      next: p => this.patient = p,
      error: () => {}
    });
  }
}
