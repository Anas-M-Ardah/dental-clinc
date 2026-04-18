import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortalAuthService } from '../../core/services/portal-auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationDto } from '../../core/models/notification.model';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .portal-wrapper {
      display: flex;
      min-height: 100vh;
    }

    /* ---- Sidebar ---- */
    .portal-sidebar {
      width: var(--sidebar-width);
      background: linear-gradient(175deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      z-index: 1000;
      transition: width var(--transition-slow);
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
    }
    .portal-sidebar::-webkit-scrollbar { width: 4px; }
    .portal-sidebar::-webkit-scrollbar-track { background: transparent; }
    .portal-sidebar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }

    .portal-sidebar.collapsed { width: var(--sidebar-collapsed-width); }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .clinic-logo { width: 42px; height: 42px; flex-shrink: 0; }
    .clinic-logo svg { width: 42px; height: 42px; }
    .clinic-info { overflow: hidden; transition: opacity var(--transition); }
    .clinic-name {
      font-size: 1rem; font-weight: 700; color: #fff;
      white-space: nowrap; letter-spacing: -0.02em;
    }
    .clinic-tagline {
      font-size: 0.7rem; color: rgba(255, 255, 255, 0.4);
      white-space: nowrap; font-weight: 400; letter-spacing: 0.02em;
    }
    .portal-sidebar.collapsed .sidebar-header { justify-content: center; padding: 24px 12px; }

    /* ---- Sidebar Nav ---- */
    .sidebar-nav { padding: 20px 12px; }
    .nav-section { margin-bottom: 28px; }
    .nav-section-title {
      font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 1.8px; color: rgba(255, 255, 255, 0.25);
      padding: 0 14px; margin-bottom: 10px;
      transition: opacity var(--transition);
    }
    .nav-item { margin-bottom: 2px; }
    .portal-nav-link {
      display: flex; align-items: center; gap: 14px;
      padding: 11px 14px; color: rgba(255, 255, 255, 0.55);
      border-radius: var(--radius-md); transition: all var(--transition);
      font-weight: 500; font-size: 0.85rem; position: relative;
      text-decoration: none;
    }
    .portal-nav-link:hover {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.9);
    }
    .portal-nav-link.active {
      background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2) 0%, rgba(var(--primary-rgb), 0.1) 100%);
      color: #fff; font-weight: 600;
    }
    .portal-nav-link.active::before {
      content: ''; position: absolute; left: 0; top: 50%;
      transform: translateY(-50%); width: 3px; height: 60%;
      background: var(--primary-500); border-radius: 0 3px 3px 0;
    }
    .nav-icon {
      width: 22px; height: 22px; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .nav-icon svg { width: 19px; height: 19px; stroke-width: 1.8; }
    .nav-text {
      white-space: nowrap; overflow: hidden;
      transition: opacity var(--transition);
    }

    /* ---- Sidebar Footer ---- */
    .sidebar-footer {
      margin-top: auto; padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .sidebar-footer-content {
      display: flex; align-items: center; gap: 8px;
      color: rgba(255, 255, 255, 0.25); font-size: 0.72rem; font-weight: 400;
    }
    .sidebar-footer-content svg { opacity: 0.5; }

    .logout-sidebar-btn {
      display: flex; align-items: center; gap: 14px;
      padding: 11px 14px; color: rgba(255, 255, 255, 0.55);
      border-radius: var(--radius-md); transition: all var(--transition);
      font-weight: 500; font-size: 0.85rem; border: none;
      background: transparent; cursor: pointer; width: 100%; text-align: left;
    }
    .logout-sidebar-btn:hover {
      background: rgba(239, 68, 68, 0.12);
      color: #fca5a5;
    }

    /* ---- Main Content ---- */
    .portal-main {
      flex: 1;
      margin-left: var(--sidebar-width);
      transition: margin-left var(--transition-slow);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .portal-main.sidebar-collapsed { margin-left: var(--sidebar-collapsed-width); }

    .portal-header {
      height: var(--header-height);
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-left { display: flex; align-items: center; }
    .header-toggle {
      width: 38px; height: 38px; display: flex;
      align-items: center; justify-content: center;
      background: var(--gray-100); border: 1px solid var(--border-color);
      border-radius: var(--radius-md); cursor: pointer;
      transition: all var(--transition-fast); margin-right: 16px;
      color: var(--gray-600);
    }
    .header-toggle:hover {
      background: var(--primary-light); border-color: var(--primary-200);
      color: var(--primary);
    }
    .header-toggle svg { width: 18px; height: 18px; }
    .header-title {
      font-size: 1rem; font-weight: 600; color: var(--gray-800);
      letter-spacing: -0.01em;
    }
    .header-right {
      display: flex; align-items: center; gap: 12px;
    }
    .patient-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; background: var(--gray-50);
      border: 1px solid var(--border-color); border-radius: var(--radius-full);
      font-weight: 500; font-size: 0.8rem; color: var(--gray-600);
    }
    .patient-badge svg { opacity: 0.6; }

    .theme-btn {
      width: 40px; height: 40px; display: flex;
      align-items: center; justify-content: center;
      background: var(--gray-50); border: 1px solid var(--border-color);
      border-radius: var(--radius-md); cursor: pointer;
      transition: all var(--transition-fast); color: var(--gray-600);
    }
    .theme-btn:hover {
      background: var(--primary-light); border-color: var(--primary-200);
      color: var(--primary);
    }
    .theme-btn svg { width: 18px; height: 18px; }

    /* Notification Bell */
    .notification-wrapper { position: relative; }
    .notification-btn {
      width: 40px; height: 40px; display: flex;
      align-items: center; justify-content: center;
      background: var(--gray-50); border: 1px solid var(--border-color);
      border-radius: var(--radius-md); cursor: pointer;
      transition: all var(--transition-fast); color: var(--gray-600); position: relative;
    }
    .notification-btn:hover {
      background: var(--primary-light); border-color: var(--primary-200);
      color: var(--primary);
    }
    .notification-btn svg { width: 18px; height: 18px; }
    .badge-count {
      position: absolute; top: -4px; right: -4px;
      min-width: 18px; height: 18px; padding: 0 5px;
      background: var(--danger); color: #fff;
      font-size: 0.65rem; font-weight: 700;
      border-radius: var(--radius-full); display: flex;
      align-items: center; justify-content: center;
      border: 2px solid #fff;
    }
    .notification-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      width: 360px; max-height: 420px; overflow-y: auto;
      background: #fff; border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-xl);
      z-index: 200; animation: dropIn 0.2s ease-out;
    }
    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .notif-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-bottom: 1px solid var(--border-color);
    }
    .notif-header-title { font-size: 0.85rem; font-weight: 700; color: var(--gray-900); }
    .notif-mark-all {
      font-size: 0.75rem; color: var(--primary); cursor: pointer;
      background: none; border: none; font-weight: 600; font-family: inherit;
    }
    .notif-mark-all:hover { text-decoration: underline; }
    .notif-item {
      display: flex; gap: 12px; padding: 12px 16px;
      border-bottom: 1px solid var(--border-light); cursor: pointer;
      transition: background var(--transition-fast);
    }
    .notif-item:hover { background: var(--gray-50); }
    .notif-item.unread { background: rgba(var(--primary-rgb), 0.04); }
    .notif-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      margin-top: 5px;
    }
    .notif-dot.unread { background: var(--primary); }
    .notif-dot.read { background: transparent; }
    .notif-content { flex: 1; min-width: 0; }
    .notif-title {
      font-size: 0.82rem; font-weight: 600; color: var(--gray-900);
      margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .notif-message {
      font-size: 0.78rem; color: var(--gray-500); line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .notif-time { font-size: 0.68rem; color: var(--gray-400); margin-top: 4px; }
    .notif-empty {
      padding: 32px 16px; text-align: center; color: var(--gray-400);
      font-size: 0.85rem;
    }

    .portal-page-content {
      flex: 1;
      padding: 28px 32px;
      animation: pageEnter 0.35s ease-out;
    }
    @keyframes pageEnter {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  template: `
    <div class="portal-wrapper">
      <!-- Sidebar -->
      <aside class="portal-sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="clinic-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="toothGradPortal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#818cf8"/>
                  <stop offset="100%" style="stop-color:#6366f1"/>
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#toothGradPortal)"/>
              <path d="M16 7c-1.8 0-3.3.6-4.2 1.7-.9 1-1.3 2.4-1.3 3.8 0 1.2.3 2.2.6 3.2.3 1 .7 2 .9 3.2.3 1.5.7 3.2 1.5 4.3.4.6.9.8 1.3.8.5 0 .9-.3 1.2-1 .3-.7.5-1.5.5-1.5s.2.8.5 1.5c.3.7.7 1 1.2 1 .4 0 .9-.2 1.3-.8.8-1.1 1.2-2.8 1.5-4.3.2-1.2.6-2.2.9-3.2.3-1 .6-2 .6-3.2 0-1.4-.4-2.8-1.3-3.8-.9-1.1-2.4-1.7-4.2-1.7z" fill="white" stroke="white" stroke-width="0.5"/>
            </svg>
          </div>
          <div class="clinic-info" *ngIf="!sidebarCollapsed">
            <div class="clinic-name">Dental Clinic</div>
            <div class="clinic-tagline">Patient Portal</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title" *ngIf="!sidebarCollapsed">OVERVIEW</div>
            <ul>
              <li class="nav-item">
                <a class="portal-nav-link" routerLink="/portal/dashboard" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Dashboard' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="portal-nav-link" routerLink="/portal/appointments" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Appointments' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Appointments</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <div class="nav-section-title" *ngIf="!sidebarCollapsed">RECORDS</div>
            <ul>
              <li class="nav-item">
                <a class="portal-nav-link" routerLink="/portal/invoices" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Invoices' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Invoices</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="portal-nav-link" routerLink="/portal/documents" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Documents' : null">
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
                <a class="portal-nav-link" routerLink="/portal/medical-history" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Medical History' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Medical History</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="portal-nav-link" routerLink="/portal/treatment-plan" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Treatment Plan' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Treatment Plan</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="portal-nav-link" routerLink="/portal/treatment-history" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Treatment History' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Treatment History</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <div class="nav-section-title" *ngIf="!sidebarCollapsed">FEEDBACK</div>
            <ul>
              <li class="nav-item">
                <a class="portal-nav-link" routerLink="/portal/surveys" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Surveys' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Surveys</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <div class="nav-section-title" *ngIf="!sidebarCollapsed">ACCOUNT</div>
            <ul>
              <li class="nav-item">
                <a class="portal-nav-link" routerLink="/portal/profile" routerLinkActive="active" [attr.title]="sidebarCollapsed ? 'Profile' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Profile</span>
                </a>
              </li>
              <li class="nav-item">
                <button class="logout-sidebar-btn" (click)="logout()" [attr.title]="sidebarCollapsed ? 'Logout' : null">
                  <span class="nav-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </span>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div class="sidebar-footer" *ngIf="!sidebarCollapsed">
          <div class="sidebar-footer-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
            <span>Patient Portal v1.0</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="portal-main" [class.sidebar-collapsed]="sidebarCollapsed">
        <header class="portal-header">
          <div class="header-left">
            <button class="header-toggle" (click)="toggleSidebar()" aria-label="Toggle sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/>
                <line x1="3" y1="18" x2="18" y2="18"/>
              </svg>
            </button>
            <h5 class="header-title">Patient Portal</h5>
          </div>
          <div class="header-right">
            <button class="theme-btn" (click)="toggleDarkMode()" [attr.title]="darkMode ? 'Light Mode' : 'Dark Mode'">
              <svg *ngIf="!darkMode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              <svg *ngIf="darkMode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </button>
            <div class="notification-wrapper">
              <button class="notification-btn" (click)="toggleNotifications($event)" aria-label="Notifications">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span class="badge-count" *ngIf="unreadCount > 0">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              </button>
              <div class="notification-dropdown" *ngIf="showNotifications">
                <div class="notif-header">
                  <span class="notif-header-title">Notifications</span>
                  <button class="notif-mark-all" *ngIf="unreadCount > 0" (click)="markAllRead()">Mark all read</button>
                </div>
                <div *ngIf="notifications.length === 0" class="notif-empty">No notifications yet</div>
                <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.isRead" (click)="markRead(n)">
                  <div class="notif-dot" [class.unread]="!n.isRead" [class.read]="n.isRead"></div>
                  <div class="notif-content">
                    <div class="notif-title">{{ n.title }}</div>
                    <div class="notif-message">{{ n.message }}</div>
                    <div class="notif-time">{{ getTimeAgo(n.createdAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
            <span class="patient-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {{ patientName }}
            </span>
          </div>
        </header>

        <main class="portal-page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class PortalLayoutComponent implements OnInit {
  patientName: string;
  sidebarCollapsed = false;
  showNotifications = false;
  unreadCount = 0;
  notifications: NotificationDto[] = [];
  darkMode = false;

  constructor(
    private authService: PortalAuthService,
    private notificationService: NotificationService
  ) {
    this.patientName = this.authService.getFullName();
    this.darkMode = localStorage.getItem('portal-dark-mode') === 'true';
    this.applyDarkMode();
  }

  ngOnInit(): void {
    this.notificationService.unreadCount.subscribe(count => this.unreadCount = count);
    this.notificationService.startPolling(60000);
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('portal-dark-mode', String(this.darkMode));
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    if (this.darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.notificationService.getNotifications().subscribe(n => this.notifications = n);
    }
  }

  @HostListener('document:click')
  closeNotifications(): void {
    this.showNotifications = false;
  }

  markRead(n: NotificationDto): void {
    if (!n.isRead) {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        n.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  logout(): void {
    this.authService.logout();
  }
}
