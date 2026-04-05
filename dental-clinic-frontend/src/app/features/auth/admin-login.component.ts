import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AdminAuthService } from '../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
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
      max-width: 420px;
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
      display: flex; align-items: center; gap: 12px; margin-bottom: 36px;
    }
    .logo-text-name { font-weight: 700; font-size: 1.1rem; color: var(--gray-800); letter-spacing: -0.02em; }
    .logo-text-tagline { font-size: 0.72rem; color: var(--gray-400); font-weight: 400; }
    .auth-title {
      font-size: 1.5rem; font-weight: 700; color: var(--gray-900);
      margin-bottom: 6px; letter-spacing: -0.025em;
    }
    .auth-subtitle { font-size: 0.85rem; color: var(--gray-500); margin-bottom: 32px; }
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
    .admin-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; background: var(--primary-light);
      color: var(--primary); border-radius: var(--radius-full);
      font-size: 0.72rem; font-weight: 600; margin-bottom: 24px;
    }
  `],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="lgAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#818cf8"/>
                <stop offset="100%" style="stop-color:#6366f1"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#lgAdmin)"/>
            <path d="M16 7c-1.8 0-3.3.6-4.2 1.7-.9 1-1.3 2.4-1.3 3.8 0 1.2.3 2.2.6 3.2.3 1 .7 2 .9 3.2.3 1.5.7 3.2 1.5 4.3.4.6.9.8 1.3.8.5 0 .9-.3 1.2-1 .3-.7.5-1.5.5-1.5s.2.8.5 1.5c.3.7.7 1 1.2 1 .4 0 .9-.2 1.3-.8.8-1.1 1.2-2.8 1.5-4.3.2-1.2.6-2.2.9-3.2.3-1 .6-2 .6-3.2 0-1.4-.4-2.8-1.3-3.8-.9-1.1-2.4-1.7-4.2-1.7z" fill="white"/>
          </svg>
          <div>
            <div class="logo-text-name">Dental Clinic</div>
            <div class="logo-text-tagline">Management System</div>
          </div>
        </div>

        <span class="admin-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Admin Access
        </span>

        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to your admin account</p>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label">Email address</label>
            <input
              type="email"
              class="form-control"
              name="email"
              [(ngModel)]="email"
              required
              email
              placeholder="admin@clinic.com"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              name="password"
              [(ngModel)]="password"
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading || !loginForm.valid">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
        </form>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(
    private authService: AdminAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMsg = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'Invalid email or password.';
        this.loading = false;
      }
    });
  }
}
