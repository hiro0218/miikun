import { webUtils } from 'electron';
import { BrowserWindow, dialog, getCurrentWindow, shell, Menu, MenuItem, nativeTheme } from '@electron/remote';

import { isURL } from '@/shared/url';

export const openDialog = (type, message) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();

  return dialog.showMessageBoxSync(focusedWindow, {
    title: type,
    type: type,
    buttons: ['OK'],
    detail: message,
  });
};

export const showFileOpenDialog = () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();

  return dialog.showOpenDialogSync(focusedWindow, {
    title: 'Open Dialog',
    filters: [
      {
        name: 'Documents',
        extensions: ['txt', 'md', 'mii'],
      },
    ],
    properties: ['openFile'],
  });
};

export const getSavePath = (extensions) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();

  return dialog.showSaveDialogSync(focusedWindow, {
    title: 'Save Dialog',
    filters: extensions,
  });
};

export const getSelectedResult = ({ title, message, type, buttons, detail }) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();

  return dialog.showMessageBoxSync(focusedWindow, {
    title,
    message,
    type,
    buttons,
    detail,
  });
};

export const openLinkExternal = () => {
  const currentWindow = getCurrentWindow();

  document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'A') return;
    const href = e.target.getAttribute('href');

    if (isURL(href)) {
      e.preventDefault();
      // get status
      const status = currentWindow.isAlwaysOnTop();
      // on top
      currentWindow.setAlwaysOnTop(true);
      // open link
      shell.openExternal(href);
      // restore
      if (!status) {
        setTimeout(function () {
          currentWindow.setAlwaysOnTop(false);
        }, 1000);
      }
    }
  });
};

let menuInstance = null;

export const setApplicationMenu = (template) => {
  Menu.setApplicationMenu(null);
  menuInstance = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menuInstance);
};

export const checkedMenuItem = (menuId, state) => {
  const menuItem = menuInstance && menuInstance.getMenuItemById(menuId);
  if (menuItem) menuItem.checked = state;
};

export const setThemeSource = (theme) => {
  nativeTheme.themeSource = theme;
};

export const isWindowAlwaysOnTop = () => getCurrentWindow().isAlwaysOnTop();

export const setWindowAlwaysOnTop = (flag) => {
  getCurrentWindow().setAlwaysOnTop(flag);
};

export const openExternal = (url) => {
  shell.openExternal(url);
};

// Electron >= 32 removed File.path; webUtils is the supported way to get it.
export const getPathForFile = (file) => webUtils.getPathForFile(file);

export const setupContextMenu = () => {
  window.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();

      const menu = new Menu();
      const selectText = window.getSelection().toString().replace(/\n+/g, ' ');

      if (selectText) {
        menu.append(
          new MenuItem({
            label:
              'Search Google for "' + (selectText.length > 20 ? selectText.substr(0, 17) + '...' : selectText) + '"',
            click: function () {
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

      menu.popup({ window: getCurrentWindow() });
    },
    false,
  );
};
