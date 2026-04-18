const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // File dialogs
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),

  // Printing
  printPage: (options) => ipcRenderer.invoke('print-page', options),
  printToPdf: () => ipcRenderer.invoke('print-to-pdf'),

  // Auto-updater
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (_event, info) => callback(info));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', (_event, info) => callback(info));
  },

  // Navigation from tray/shortcuts
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (_event, route) => callback(route));
  },

  // Print request from shortcut
  onPrintRequest: (callback) => {
    ipcRenderer.on('print-request', () => callback());
  },

  // Online status
  isOnline: () => navigator.onLine,
  onOnlineStatusChange: (callback) => {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  },
});
