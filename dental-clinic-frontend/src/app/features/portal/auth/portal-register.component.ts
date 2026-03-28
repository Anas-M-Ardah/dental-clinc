import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PortalAuthService } from '../../../core/services/portal-auth.service';
import { Gender } from '../../../core/models/patient.model';

@Component({
  selector: 'app-portal-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 24px;
      position: relative;
      overflow: hidden;
    }
    .auth-page::before {
      content: '';
      position: absolute;
      top: -50%; left: -50%; width: 200%; height: 200%;
      background: radial-gradient(circle at 30% 40%, rgba(79,70,229,0.12) 0%, transparent 50%),
                  radial-gradient(circle at 70% 60%, rgba(99,102,241,0.08) 0%, transparent 50%);
      pointer-events: none;
    }
    .auth-card {
      background: #fff;
      border-radius: var(--radius-xl);
      padding: 44px;
      width: 100%;
      max-width: 520px;
      box-shadow: var(--shadow-xl);
      position: relative;
      z-index: 1;
      animation: cardEnter 0.4s ease-out;
    }
    @keyframes cardEnter {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .auth-logo {
      display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
    }
    .logo-text-name { font-weight: 700; font-size: 1rem; color: var(--gray-800); letter-spacing: -0.02em; }
    .logo-text-tagline { font-size: 0.72rem; color: var(--gray-400); font-weight: 400; }
    .auth-title {
      font-size: 1.5rem; font-weight: 700; color: var(--gray-900);
      margin-bottom: 6px; letter-spacing: -0.025em;
    }
    .auth-subtitle {
      font-size: 0.85rem; color: var(--gray-500); margin-bottom: 28px;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { margin-bottom: 16px; }
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
    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 36px;
    }
    .btn-primary {
      width: 100%; padding: 12px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-500) 100%);
      color: #fff; border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem; font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      margin-top: 8px; font-family: inherit;
      box-shadow: 0 1px 3px rgba(var(--primary-rgb), 0.2);
    }
    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      transform: translateY(-1px);
      box-shadow: var(--shadow-primary);
    }
    .btn-primary:disabled {
      opacity: 0.55; cursor: not-allowed;
      transform: none; box-shadow: none;
    }
    .error-msg {
      color: var(--danger); font-size: 0.8rem;
      margin-top: 14px; text-align: center;
      padding: 10px; background: var(--danger-light);
      border-radius: var(--radius-sm);
    }
    .auth-footer {
      text-align: center; margin-top: 24px;
      font-size: 0.85rem; color: var(--gray-500);
    }
    .auth-footer a {
      color: var(--primary); text-decoration: none;
      font-weight: 600; transition: color var(--transition-fast);
    }
    .auth-footer a:hover { color: var(--primary-dark); }
  `],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#818cf8"/>
                <stop offset="100%" style="stop-color:#6366f1"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#lg2)"/>
            <path d="M16 7c-1.8 0-3.3.6-4.2 1.7-.9 1-1.3 2.4-1.3 3.8 0 1.2.3 2.2.6 3.2.3 1 .7 2 .9 3.2.3 1.5.7 3.2 1.5 4.3.4.6.9.8 1.3.8.5 0 .9-.3 1.2-1 .3-.7.5-1.5.5-1.5s.2.8.5 1.5c.3.7.7 1 1.2 1 .4 0 .9-.2 1.3-.8.8-1.1 1.2-2.8 1.5-4.3.2-1.2.6-2.2.9-3.2.3-1 .6-2 .6-3.2 0-1.4-.4-2.8-1.3-3.8-.9-1.1-2.4-1.7-4.2-1.7z" fill="white"/>
          </svg>
          <div>
            <div class="logo-text-name">Dental Clinic</div>
            <div class="logo-text-tagline">Patient Portal</div>
          </div>
        </div>

        <h1 class="auth-title">Create your account</h1>
        <p class="auth-subtitle">Register to access your patient portal</p>

        <form (ngSubmit)="onSubmit()" #regForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">First name</label>
              <input type="text" class="form-control" name="firstName" [(ngModel)]="dto.firstName" required placeholder="John" />
            </div>
            <div class="form-group">
              <label class="form-label">Last name</label>
              <input type="text" class="form-control" name="lastName" [(ngModel)]="dto.lastName" required placeholder="Doe" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email address</label>
            <input type="email" class="form-control" name="email" [(ngModel)]="dto.email" required email placeholder="you@example.com" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="tel" class="form-control" name="phone" [(ngModel)]="dto.phone" required placeholder="+962 7X XXX XXXX" />
            </div>
            <div class="form-group">
              <label class="form-label">Date of birth</label>
              <input type="date" class="form-control" name="dateOfBirth" [(ngModel)]="dto.dateOfBirth" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Gender</label>
            <select class="form-control" name="gender" [(ngModel)]="dto.gender">
              <option [value]="Gender.Male">Male</option>
              <option [value]="Gender.Female">Female</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" name="password" [(ngModel)]="dto.password" required minlength="8" placeholder="At least 8 characters" />
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading || !regForm.valid">
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/portal/login">Sign in</a>
        </div>
      </div>
    </div>
  `
})
export class PortalRegisterComponent {
  Gender = Gender;

  dto = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: Gender.Male,
    password: ''
  };

  loading = false;
  errorMsg = '';

  constructor(private authService: PortalAuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMsg = '';

    this.authService.register(this.dto).subscribe({
      next: () => this.router.navigate(['/portal/dashboard']),
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
