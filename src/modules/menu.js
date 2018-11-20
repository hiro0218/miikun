import electron from 'electron';
const { remote } = electron;
const { Menu, dialog, nativeImage } = remote;
const iconImage = nativeImage.createFromPath('./build/icons/256x256.png');
const shell = remote.shell;
const pkg = require('../../package.json');
const OSX = process.platform === 'darwin';
const WIN = process.platform === 'win32';

export default {
  menubar: [],
  newFile: function() {},
  openFile: function() {},
  saveFile: function() {},
  saveAsFile: function() {},
  togglePreview: function() {},
  toggleToolbar: function() {},
  ready: function() {
    var self = this;

    self.addMenuOSX();
    self.menubar.push(
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            accelerator: 'CmdOrCtrl+N',
            click: function() {
              self.newFile();
            },
          },
          {
            label: 'Open',
            accelerator: 'CmdOrCtrl+O',
            click: function() {
              self.openFile();
            },
          },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: function() {
              self.saveFile();
            },
          },
          {
            label: 'Save as',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: function() {
              self.saveAsFile();
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
          { label: 'Redo', accelerator: 'CmdOrCtrl+Y', selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { type: 'separator' },
          {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            selector: 'selectAll:',
          },
        ],
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Preview Panel',
            type: 'checkbox',
            checked: true,
            click: function(item, focusedWindow) {
              self.togglePreview();
            },
          },
          {
            label: 'Toggle Toolbar',
            type: 'checkbox',
            checked: true,
            click: function(item, focusedWindow) {
              self.toggleToolbar();
            },
          },
          {
            label: 'Toggle Full Screen',
            role: 'togglefullscreen',
          },
          { type: 'separator' },
          {
            label: 'Zoom',
            submenu: [
              {
                label: 'Zoom In',
                role: 'zoomIn',
              },
              {
                label: 'Zoom Out',
                role: 'zoomOut',
              },
              { type: 'separator' },
              {
                label: 'Actual Size',
                role: 'resetZoom',
              },
            ],
          },
          { type: 'separator' },
          {
            label: 'Always on Top',
            accelerator: 'CmdOrCtrl+Shift+T',
            type: 'checkbox',
            checked: false,
            click: function(item, focusedWindow) {
              focusedWindow.setAlwaysOnTop(!focusedWindow.isAlwaysOnTop());
            },
          },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Website',
            click: function() {
              shell.openExternal('https://github.com/hiro0218/miikun/');
            },
          },
          {
            label: 'Release Note',
            click: function() {
              shell.openExternal('https://github.com/hiro0218/Miikun/releases');
            },
          },
          { type: 'separator' },
          {
            label: 'About',
            click: function(item, focusedWindow) {
              dialog.showMessageBox(focusedWindow, {
                title: 'About',
                type: 'none',
                icon: iconImage,
                message: `${pkg.name} Ver. ${pkg.version}`,
                detail:
                  pkg.description +
                  '\n\n' +
                  'Electron: ' +
                  process.versions.electron +
                  '\n' +
                  'Chromium: ' +
                  process.versions.chrome +
                  '\n' +
                  'V8: ' +
                  process.versions.v8 +
                  '\n' +
                  'Node.js: ' +
                  process.versions.node,
                buttons: [],
              });
            },
          },
        ],
      },
    );

    self.addMenuWin();

    Menu.setApplicationMenu(Menu.buildFromTemplate(self.menubar));
  },
  addMenuOSX: function() {
    if (!OSX) {
      return;
    }
    var self = this;
    self.menubar.push({
      label: pkg.name,
      submenu: [
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: function(item, focusedWindow) {
            focusedWindow.close();
          },
        },
      ],
    });
  },
  addMenuWin: function() {
    if (!WIN) {
      return;
    }
    var self = this;
    self.menubar[0].submenu.push(
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function(item, focusedWindow) {
          focusedWindow.close();
        },
      },
    );
  },
};
