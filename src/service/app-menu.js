import electron from 'electron';
const { remote } = electron;
const { shell, Menu, MenuItem } = remote;

import { name } from '../../package.json';
const isDevelopment = process.env.NODE_ENV !== 'production';

import store from '../store';
import AppMenuController from '@/service/app-menu-controller';

export default {
  menuInstance: null,
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
          checked: store.getters.isAlwaysOnTop,
          click: () => {
            AppMenuController.toggleAlwaysOnTop();
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
  setupAppMenu() {
    Menu.setApplicationMenu(null);
    this.menuInstance = Menu.buildFromTemplate(this.appmMenuList);
    Menu.setApplicationMenu(this.menuInstance);

    // Update based on store
    // set always on top
    if (store.getters.isAlwaysOnTop) {
      const currentWindow = remote.getCurrentWindow();
      currentWindow.setAlwaysOnTop(store.getters.isAlwaysOnTop);
    }
  },
  setupContextMenu() {
    window.addEventListener(
      'contextmenu',
      e => {
        e.preventDefault();

        const menu = new Menu();
        const selectText = window
          .getSelection()
          .toString()
          .replace(/\n+/g, ' ');

        if (selectText) {
          menu.append(
            new MenuItem({
              label:
                'Search Google for "' + (selectText.length > 20 ? selectText.substr(0, 17) + '...' : selectText) + '"',
              click: function() {
                shell.openExternal('https://www.google.com/search?q=' + encodeURIComponent(selectText));
              },
            }),
          );
          menu.append(
            new MenuItem({
              type: 'separator',
            }),
          );
        }

        menu.append(
          new MenuItem({
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy',
          }),
        );

        menu.popup({ window: remote.getCurrentWindow() });
      },
      false,
    );
  },
  getInstance() {
    return this.menuInstance;
  },
  getMenuItemById(menuId) {
    return this.menuInstance.getMenuItemById(menuId);
  },
  checkedMenuItem(menuId, state) {
    const appMenuItem = this.getMenuItemById(menuId);
    if (appMenuItem) appMenuItem.checked = state;
  },
};
