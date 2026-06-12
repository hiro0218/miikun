import {
  setApplicationMenu,
  checkedMenuItem,
  setupContextMenu as setupNativeContextMenu,
  setThemeSource,
  setWindowAlwaysOnTop,
  openExternal,
} from '@/adapters/electron';

import packageJson from '../../package.json';
const { name } = packageJson;
const isDevelopment = process.env.NODE_ENV !== 'production';

import store from '../store';
import AppMenuController from '@/services/app-menu-controller';

export default {
  appMenuList: [
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
          label: 'Theme',
          submenu: [
            {
              id: 'theme_system',
              label: 'System',
              type: 'radio',
              checked: store.getters.theme === 'system',
              click: () => {
                AppMenuController.setTheme('system');
              },
            },
            {
              id: 'theme_light',
              label: 'Light',
              type: 'radio',
              checked: store.getters.theme === 'light',
              click: () => {
                AppMenuController.setTheme('light');
              },
            },
            {
              id: 'theme_dark',
              label: 'Dark',
              type: 'radio',
              checked: store.getters.theme === 'dark',
              click: () => {
                AppMenuController.setTheme('dark');
              },
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
            openExternal('https://github.com/hiro0218/miikun/');
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
    setApplicationMenu(this.appMenuList);

    // Update based on store
    // set always on top
    if (store.getters.isAlwaysOnTop) {
      setWindowAlwaysOnTop(true);
    }

    // apply persisted theme
    setThemeSource(store.getters.theme);

    // Menu checkboxes follow the store so controllers never reach back into the menu.
    store.subscribe((mutation, state) => {
      if (mutation.type === 'UPDATE_ISPREVIEW') {
        checkedMenuItem('toggle_preview_panel', state.Editor.isPreview);
      } else if (mutation.type === 'TOGGLE_TOOLBAR') {
        checkedMenuItem('toggle_toolbar', state.Editor.openToolbar);
      }
    });
  },
  setupContextMenu() {
    setupNativeContextMenu();
  },
};
