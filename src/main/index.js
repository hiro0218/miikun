'use strict';

import { app, BrowserWindow, ipcMain } from 'electron';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    resizable: true,
    webPreferences: {
      textAreasAreResizable: false,
    },
    useContentSize: true,
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('ask-key', askKeyEvent => {
  let askKeyPrompt = new BrowserWindow({
    width: 350,
    height: 100,
    parent: mainWindow,
    modal: true,
    frame: false,
    resizable: false,
  });
  askKeyPrompt.loadURL(
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:9080/#/ask-key'
      : `file://${__dirname}/index.html#ask-key`,
  );
  ipcMain.once('set-key', (setKeyEvent, setKeyArgu) => {
    askKeyPrompt.close();
    askKeyPrompt = null;
    askKeyEvent.sender.send('reply-ask-key', setKeyArgu);
  });
});
