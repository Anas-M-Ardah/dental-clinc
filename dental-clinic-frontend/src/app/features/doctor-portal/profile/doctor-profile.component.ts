import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { DoctorProfileDto, UpdateDoctorProfileDto } from '../../../core/models/doctor-auth.model';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin-bottom: 4px; }
    .page-sub { font-size: 0.9rem; color: var(--gray-500); margin-bottom: 24px; }
    .panel { background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 18px; max-width: 640px; }
    .panel h2 { font-size: 1.05rem; font-weight: 700; color: var(--gray-900); margin: 0 0 16px; }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field-grid .full { grid-column: 1 / -1; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    label { font-size: 0.78rem; font-weight: 600; color: var(--gray-600); }
    .field-input, .field-textarea {
      padding: 9px 12px; border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md); font-size: 0.86rem; font-family: inherit; box-sizing: border-box;
    }
    .field-input:disabled { background: var(--gray-50); color: var(--gray-500); }
    .field-textarea { min-height: 90px; resize: vertical; }
    .btn {
      padding: 10px 18px; border: none; border-radius: var(--radius-md);
      font-weight: 600; font-size: 0.85rem; cursor: pointer; font-family: inherit;
      background: #0284c7; color: #fff;
    }
    .btn:hover:not(:disabled) { background: #0369a1; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .actions { margin-top: 16px; display: flex; justify-content: flex-end; gap: 10px; }
    .toast { position: fixed; bottom: 24px; right: 24px; background: var(--gray-900); color: #fff; padding: 10px 18px; border-radius: var(--radius-md); font-size: 0.85rem; box-shadow: var(--shadow-xl); z-index: 2000; }
    .toast.err { background: #b91c1c; }
    .loading { padding: 28px; text-align: center; color: var(--gray-400); }
  `],
  template: `
    <h1 class="page-title">My Profile</h1>
    <p class="page-sub">Update your professional details and account password.</p>

    <div *ngIf="loading" class="loading">Loading…</div>

    <ng-container *ngIf="!loading && profile">
      <div class="panel">
        <h2>Professional Details</h2>
        <div class="field-grid">
          <div class="form-group">
            <label>Specialization</label>
            <input class="field-input" [value]="profile.specialization" disabled />
          </div>
          <div class="form-group">
            <label>Member Since</label>
            <input class="field-input" [value]="formatDate(profile.createdAt)" disabled />
          </div>
          <div class="form-group">
            <label>First Name</label>
            <input class="field-input" [(ngModel)]="edit.firstName" />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input class="field-input" [(ngModel)]="edit.lastName" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input class="field-input" [(ngModel)]="edit.phone" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input class="field-input" type="email" [(ngModel)]="edit.email" />
          </div>
          <div class="form-group full">
            <label>Bio</label>
            <textarea class="field-textarea" [(ngModel)]="edit.bio"></textarea>
          </div>
        </div>
        <div class="actions">
          <button class="btn" (click)="saveProfile()" [disabled]="saving">{{ saving ? 'Saving…' : 'Save Changes' }}</button>
        </div>
      </div>

      <div class="panel">
        <h2>Change Password</h2>
        <div class="field-grid">
          <div class="form-group full">
            <label>Current Password</label>
            <input class="field-input" type="password" [(ngModel)]="pw.currentPassword" />
          </div>
          <div class="form-group full">
            <label>New Password (min 8 characters)</label>
            <input class="field-input" type="password" [(ngModel)]="pw.newPassword" />
          </div>
        </div>
        <div class="actions">
          <button class="btn" (click)="changePassword()" [disabled]="changingPw || !pw.currentPassword || !pw.newPassword || pw.newPassword.length < 8">
            {{ changingPw ? 'Updating…' : 'Update Password' }}
          </button>
        </div>
      </div>
    </ng-container>

    <div class="toast" [class.err]="toastErr" *ngIf="toast">{{ toast }}</div>
  `
})
export class DoctorProfileComponent implements OnInit {
  profile: DoctorProfileDto | null = null;
  loading = true;
  saving = false;
  changingPw = false;
  toast = '';
  toastErr = false;

  edit: UpdateDoctorProfileDto = { firstName: '', lastName: '', phone: '', email: '', bio: '' };
  pw = { currentPassword: '', newPassword: '' };

  constructor(private api: DoctorApiService) {}

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: p => {
        this.profile = p;
        this.edit = {
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone,
          email: p.email ?? '',
          bio: p.bio ?? ''
        };
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  saveProfile(): void {
    this.saving = true;
    this.api.updateProfile(this.edit).subscribe({
      next: p => { this.profile = p; this.saving = false; this.flash('Profile updated', false); },
      error: () => { this.saving = false; this.flash('Failed to update profile', true); }
    });
  }

  changePassword(): void {
    this.changingPw = true;
    this.api.changePassword({ currentPassword: this.pw.currentPassword, newPassword: this.pw.newPassword }).subscribe({
      next: () => {
        this.changingPw = false;
        this.pw = { currentPassword: '', newPassword: '' };
        this.flash('Password updated', false);
      },
      error: err => {
        this.changingPw = false;
        const msg = err?.error?.message ?? 'Failed to update password';
        this.flash(msg, true);
      }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private flash(msg: string, err: boolean): void {
    this.toast = msg; this.toastErr = err;
    setTimeout(() => this.toast = '', 2200);
  }
}
