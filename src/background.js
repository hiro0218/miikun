'use strict';

import { app, BrowserWindow, nativeTheme } from 'electron';
import { initialize, enable } from '@electron/remote/main';
import { join } from 'node:path';

const isDevelopment = !app.isPackaged;

initialize();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('jp.0218.miikun');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    center: true,
    // Match Generic/_tokens.scss --bg so the window doesn't flash white in dark mode.
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#141414' : '#ffffff',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  enable(win.webContents);

  if (process.env.ELECTRON_RENDERER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.ELECTRON_RENDERER_URL);

    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    // Load the index.html when not in development
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
