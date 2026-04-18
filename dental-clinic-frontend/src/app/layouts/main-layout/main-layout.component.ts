import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { OfflineBannerComponent } from '../../shared/offline-banner.component';
import { UpdateBannerComponent } from '../../shared/update-banner.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, OfflineBannerComponent, UpdateBannerComponent],
  template: `
    <app-offline-banner></app-offline-banner>
    <app-update-banner></app-update-banner>
    <div class="app-wrapper" [class.rtl]="currentLang === 'ar'" [attr.dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed" [class.sidebar-end]="currentLang === 'ar'">
        <div class="sidebar-header">
          <div class="clinic-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="toothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#818cf8"/>
                  <stop offset="100%" style="stop-color:#6366f1"/>
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#toothGrad)"/>
              <path d="M16 7c-1.8 0-3.3.6-4.2 1.7-.9 1-1.3 2.4-1.3 3.8 0 1.2.3 2.2.6 3.2.3 1 .7 2 .9 3.2.3 1.5.7 3.2 1.5 4.3.4.6.9.8 1.3.8.5 0 .9-.3 1.2-1 .3-.7.5-1.5.5-1.5s.2.8.5 1.5c.3.7.7 1 1.2 1 .4 0 .9-.2 1.3-.8.8-1.1 1.2-2.8 1.5-4.3.2-1.2.6-2.2.9-3.2.3-1 .6-2 .6-3.2 0-1.4-.4-2.8-1.3-3.8-.9-1.1-2.4-1.7-4.2-1.7z" fill="white" stroke="white" stroke-width="0.5"/>
            </svg>
          </div>
          <div class="clinic-info" *ngIf="!sidebarCollapsed">
            <div class="clinic-name">{{ 'nav.clinicName' | translate }}</div>
            <div class="clinic-tagline">{{ currentLang === 'en' ? 'Care Center' : 'مركز رعاية' }}</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title" *ngIf="!sidebarCollapsed">{{ currentLang === 'en' ? 'MAIN' : 'الرئيسية' }}</div>
            <ul class="nav">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" [attr.title]="sidebarCollapsed ? ('nav.dashboard' | translate) : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">{{ 'nav.dashboard' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/patients" routerLinkActive="active" [attr.title]="sidebarCollapsed ? ('nav.patients' | translate) : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">{{ 'nav.patients' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/appointments" routerLinkActive="active" [attr.title]="sidebarCollapsed ? ('nav.appointments' | translate) : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">{{ 'nav.appointments' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/doctors" routerLinkActive="active" [attr.title]="sidebarCollapsed ? ('nav.doctors' | translate) : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4h-1"/>
                      <circle cx="15" cy="7" r="4"/>
                      <path d="M8 11v4"/>
                      <path d="M6 13h4"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">{{ 'nav.doctors' | translate }}</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <div class="nav-section-title" *ngIf="!sidebarCollapsed">{{ currentLang === 'en' ? 'MANAGEMENT' : 'الإدارة' }}</div>
            <ul class="nav">
              <li class="nav-item">
                <a class="nav-link" routerLink="/treatments" routerLinkActive="active" [attr.title]="sidebarCollapsed ? ('nav.treatments' | translate) : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">{{ 'nav.treatments' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/invoices" routerLinkActive="active" [attr.title]="sidebarCollapsed ? ('nav.billing' | translate) : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">{{ 'nav.billing' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/coupons" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Coupons' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                      <path d="M13 5v2"/>
                      <path d="M13 17v2"/>
                      <path d="M13 11v2"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Coupons</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/reports" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Reports' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Reports</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/documents" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Documents' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Documents</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/treatment-records" routerLinkActive="active" [attr.title]="sidebarCollapsed ? ('nav.treatmentRecords' | translate) : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <line x1="10" y1="9" x2="8" y2="9"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">{{ 'nav.treatmentRecords' | translate }}</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer" *ngIf="!sidebarCollapsed">
          <div class="sidebar-footer-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content" [class.sidebar-collapsed]="sidebarCollapsed" [class.content-start]="currentLang === 'ar'">
        <!-- Header -->
        <header class="app-header">
          <div class="header-left">
            <button class="header-toggle" (click)="toggleSidebar()" aria-label="Toggle sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="15" y2="12"/>
                <line x1="3" y1="18" x2="18" y2="18"/>
              </svg>
            </button>
            <h5 class="header-title">{{ 'nav.clinicManagement' | translate }}</h5>
          </div>

          <div class="header-actions">
            <button class="lang-btn" (click)="toggleLanguage()" aria-label="Switch language">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>{{ currentLang === 'en' ? 'العربية' : 'English' }}</span>
            </button>
            <button class="lang-btn" (click)="logout()" aria-label="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>{{ currentLang === 'en' ? 'Logout' : 'خروج' }}</span>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  currentLang = 'en';
  sidebarCollapsed = false;

  constructor(
    private translationService: TranslationService,
    private adminAuthService: AdminAuthService
  ) {
    this.currentLang = this.translationService.currentLanguage;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.translationService.setLanguage(newLang);
    this.currentLang = newLang;
  }

  logout() {
    this.adminAuthService.logout();
  }
}
