import { BrowserWindow, dialog, getCurrentWindow, shell } from '@electron/remote';

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
