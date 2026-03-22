import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="app-wrapper" [class.rtl]="currentLang === 'ar'" [attr.dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed" [class.sidebar-end]="currentLang === 'ar'">
        <div class="sidebar-header">
          <div class="clinic-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.24 2 7 4.24 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3zm-1 10h2v3h-2v-3z"/>
            </svg>
          </div>
          <div class="clinic-info">
            <div class="clinic-name">{{ 'nav.clinicName' | translate }}</div>
            <div class="clinic-tagline">Dental Care Center</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">Main Menu</div>
            <ul class="nav">
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </span>
                  <span class="nav-text">{{ 'nav.dashboard' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/patients" routerLinkActive="active">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </span>
                  <span class="nav-text">{{ 'nav.patients' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/appointments" routerLinkActive="active">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                  <span class="nav-text">{{ 'nav.appointments' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/doctors" routerLinkActive="active">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </span>
                  <span class="nav-text">{{ 'nav.doctors' | translate }}</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Management</div>
            <ul class="nav">
              <li class="nav-item">
                <a class="nav-link" routerLink="/treatments" routerLinkActive="active">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </span>
                  <span class="nav-text">{{ 'nav.treatments' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/invoices" routerLinkActive="active">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </span>
                  <span class="nav-text">{{ 'nav.billing' | translate }}</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/treatment-records" routerLinkActive="active">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </span>
                  <span class="nav-text">{{ 'nav.treatmentRecords' | translate }}</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="main-content" [class.sidebar-collapsed]="sidebarCollapsed" [class.content-start]="currentLang === 'ar'">
        <!-- Header -->
        <header class="app-header">
          <button class="header-toggle" (click)="toggleSidebar()" *ngIf="currentLang === 'en'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          
          <h5 class="header-title">{{ 'nav.clinicManagement' | translate }}</h5>
          
          <div class="header-actions">
            <button class="header-toggle" (click)="toggleSidebar()" *ngIf="currentLang === 'ar'">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <button class="lang-btn" (click)="toggleLanguage()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {{ currentLang === 'en' ? 'العربية' : 'English' }}
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

  constructor(private translationService: TranslationService) {
    this.currentLang = this.translationService.currentLanguage;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.translationService.setLanguage(newLang);
    this.currentLang = newLang;
    window.location.reload();
  }
}
