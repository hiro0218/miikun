import electron from 'electron';
const { remote } = electron;
const { shell } = remote;
import { name } from '../../package.json';
// const isMac = process.platform === 'darwin';
// const WIN = process.platform === 'win32';
const isDevelopment = process.env.NODE_ENV !== 'production';

import store from '../store';
import AppMenuController from '@/service/app-menu-controller';

export default {
  appmMenuList: [
    {
      label: name,
      submenu: [{ role: 'quit' }],
    },
    {
      id: 'file',
      label: 'File',
      submenu: [
        {
          id: 'new',
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click() {
            AppMenuController.newFile();
          },
        },
        {
          id: 'open',
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click() {
            AppMenuController.openFile();
          },
        },
        {
          id: 'save',
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click() {
            AppMenuController.saveFile();
          },
        },
        {
          id: 'save_as',
          label: 'Save as',
          accelerator: 'CmdOrCtrl+Shift+S',
          click() {
            AppMenuController.saveAs();
          },
        },
      ],
    },
    {
      id: 'edit',
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
      id: 'view',
      label: 'View',
      submenu: [
        {
          id: 'toggle_preview_panel',
          label: 'Toggle Preview Panel',
          type: 'checkbox',
          checked: store.state.Editor.isPreview,
          click() {
            AppMenuController.togglePreview();
          },
        },
        {
          id: 'toggle_toolbar',
          label: 'Toggle Toolbar',
          type: 'checkbox',
          checked: store.state.Editor.openToolbar,
          click() {
            AppMenuController.toggleToolbar();
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
          click: (item, focusedWindow) => {
            focusedWindow.setAlwaysOnTop(!focusedWindow.isAlwaysOnTop());
          },
        },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Website',
          click: () => {
            shell.openExternal('https://github.com/hiro0218/miikun/');
          },
        },
      ],
    },
    ...(isDevelopment
      ? [
          {
            id: 'develop',
            label: 'Development',
            submenu: [{ role: 'reload' }, { role: 'forcereload' }, { role: 'toggledevtools' }],
          },
        ]
      : []),
  ],
};
