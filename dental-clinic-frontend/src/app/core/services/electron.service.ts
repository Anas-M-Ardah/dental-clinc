import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

interface ElectronAPI {
  getAppInfo: () => Promise<{ version: string; name: string; isPackaged: boolean; platform: string }>;
  showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
  showSaveDialog: (options: any) => Promise<{ canceled: boolean; filePath: string }>;
  showNotification: (title: string, body: string) => Promise<boolean>;
  printPage: (options?: any) => Promise<boolean>;
  printToPdf: () => Promise<ArrayBuffer | null>;
  installUpdate: () => Promise<void>;
  onUpdateAvailable: (callback: (info: any) => void) => void;
  onUpdateDownloaded: (callback: (info: any) => void) => void;
  onNavigate: (callback: (route: string) => void) => void;
  onPrintRequest: (callback: () => void) => void;
  isOnline: () => boolean;
  onOnlineStatusChange: (callback: (online: boolean) => void) => void;
}

@Injectable({ providedIn: 'root' })
export class ElectronService {
  private api: ElectronAPI | null = null;

  isElectron = false;
  isOnline$ = new BehaviorSubject<boolean>(true);
  updateAvailable$ = new BehaviorSubject<any>(null);
  updateDownloaded$ = new BehaviorSubject<any>(null);

  constructor(private router: Router, private zone: NgZone) {
    this.api = (window as any).electronAPI ?? null;
    this.isElectron = this.api !== null;

    if (this.isElectron) {
      this.isOnline$.next(this.api!.isOnline());
      this.setupListeners();
    }
  }

  private setupListeners(): void {
    if (!this.api) return;

    this.api.onNavigate((route) => {
      this.zone.run(() => this.router.navigateByUrl(route));
    });

    this.api.onPrintRequest(() => {
      this.zone.run(() => this.printPage());
    });

    this.api.onOnlineStatusChange((online) => {
      this.zone.run(() => this.isOnline$.next(online));
    });

    this.api.onUpdateAvailable((info) => {
      this.zone.run(() => this.updateAvailable$.next(info));
    });

    this.api.onUpdateDownloaded((info) => {
      this.zone.run(() => this.updateDownloaded$.next(info));
    });
  }

  async getAppInfo() {
    return this.api?.getAppInfo() ?? { version: '0.0.0', name: 'Dental Clinic', isPackaged: false, platform: 'web' };
  }

  async showOpenDialog(options: any) {
    return this.api?.showOpenDialog(options) ?? { canceled: true, filePaths: [] };
  }

  async showSaveDialog(options: any) {
    return this.api?.showSaveDialog(options) ?? { canceled: true, filePath: '' };
  }

  async showNotification(title: string, body: string) {
    if (this.api) {
      return this.api.showNotification(title, body);
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
    return false;
  }

  async printPage(options?: any) {
    if (this.api) {
      return this.api.printPage(options);
    }
    window.print();
    return true;
  }

  async printToPdf() {
    return this.api?.printToPdf() ?? null;
  }

  async installUpdate() {
    return this.api?.installUpdate();
  }
}
