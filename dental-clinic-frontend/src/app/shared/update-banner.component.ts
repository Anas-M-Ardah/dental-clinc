import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectronService } from '../core/services/electron.service';

@Component({
  selector: 'app-update-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (electron.isElectron && (electron.updateDownloaded$ | async); as update) {
      <div class="update-banner">
        <span>Version {{ update.version }} is ready to install.</span>
        <button (click)="installUpdate()">Restart & Update</button>
        <button class="dismiss" (click)="dismiss()">Later</button>
      </div>
    }
  `,
  styles: [`
    .update-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 8px 16px;
      background: #2563eb;
      color: #fff;
      font-size: 13px;
      font-weight: 500;
      text-align: center;
      z-index: 9999;
    }
    button {
      padding: 4px 12px;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.15);
      color: #fff;
      font-size: 12px;
      cursor: pointer;
    }
    button:hover { background: rgba(255,255,255,0.25); }
    button.dismiss {
      background: transparent;
      border-color: transparent;
      text-decoration: underline;
    }
  `]
})
export class UpdateBannerComponent {
  constructor(public electron: ElectronService) {}

  installUpdate(): void {
    this.electron.installUpdate();
  }

  dismiss(): void {
    this.electron.updateDownloaded$.next(null);
  }
}
