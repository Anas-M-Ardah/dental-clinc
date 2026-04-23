const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, Notification, globalShortcut, nativeImage, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow = null;
let tray = null;
let isQuitting = false;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Dental Clinic Management',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
    try {
      require('electron-reload')(path.join(__dirname, '..', 'dist'), {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      });
    } catch (_) {}
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '..', 'dist', 'dental-clinic-frontend', 'browser', 'index.html')
    );
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    }
  } catch (_) {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Dental Clinic Management');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Dental Clinic',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Dashboard',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', '/dashboard');
        }
      },
    },
    {
      label: 'Appointments',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', '/appointments');
        }
      },
    },
    {
      label: 'Patients',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('navigate', '/patients');
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function registerShortcuts() {
  // Ctrl+Shift+D = Dashboard
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send('navigate', '/dashboard');
    }
  });

  // Ctrl+Shift+A = Appointments
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send('navigate', '/appointments');
    }
  });

  // Ctrl+Shift+P = Patients
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send('navigate', '/patients');
    }
  });

  // Ctrl+P = Print current page
  globalShortcut.register('CommandOrControl+P', () => {
    if (mainWindow && mainWindow.isFocused()) {
      mainWindow.webContents.send('print-request');
    }
  });
}

function setupAutoUpdater() {
  if (isDev) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) {
      mainWindow.webContents.send('update-available', info);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info);
    }
    new Notification({
      title: 'Update Ready',
      body: `Version ${info.version} has been downloaded. Restart to apply.`,
    }).show();
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err);
  });

  autoUpdater.checkForUpdatesAndNotify();
}

// --- IPC Handlers ---

ipcMain.handle('get-app-info', () => ({
  version: app.getVersion(),
  name: app.getName(),
  isPackaged: app.isPackaged,
  platform: process.platform,
}));

ipcMain.handle('show-open-dialog', async (_event, options) => {
  if (!mainWindow) return { canceled: true, filePaths: [] };
  return dialog.showOpenDialog(mainWindow, options);
});

ipcMain.handle('show-save-dialog', async (_event, options) => {
  if (!mainWindow) return { canceled: true, filePath: '' };
  return dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('show-notification', (_event, { title, body }) => {
  new Notification({ title, body }).show();
  return true;
});

ipcMain.handle('print-page', (_event, options = {}) => {
  if (!mainWindow) return false;
  mainWindow.webContents.print({
    silent: false,
    printBackground: true,
    ...options,
  });
  return true;
});

ipcMain.handle('print-to-pdf', async () => {
  if (!mainWindow) return null;
  const data = await mainWindow.webContents.printToPDF({
    printBackground: true,
    landscape: false,
  });
  return data;
});

ipcMain.handle('get-online-status', () => {
  return { online: require('dns').resolve !== undefined };
});

ipcMain.handle('install-update', () => {
  isQuitting = true;
  autoUpdater.quitAndInstall();
});

// --- App Lifecycle ---

const gotSingleLock = app.requestSingleInstanceLock();
if (!gotSingleLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
    registerShortcuts();
    setupAutoUpdater();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else if (mainWindow) {
        mainWindow.show();
      }
    });
  });

  app.on('before-quit', () => {
    isQuitting = true;
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
