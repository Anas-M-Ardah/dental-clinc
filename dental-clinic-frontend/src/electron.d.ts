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

interface Window {
  electronAPI?: ElectronAPI;
}
