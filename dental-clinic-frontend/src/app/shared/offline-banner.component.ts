import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectronService } from '../core/services/electron.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (electron.isElectron && !(electron.isOnline$ | async)) {
      <div class="offline-banner">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <span>You are offline. Some features may be unavailable.</span>
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f59e0b;
      color: #1a1a1a;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      z-index: 9999;
    }
    .offline-banner svg {
      flex-shrink: 0;
    }
  `]
})
export class OfflineBannerComponent {
  constructor(public electron: ElectronService) {}
}
