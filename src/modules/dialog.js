import electron from 'electron';
const { remote } = electron;
const { BrowserWindow, dialog } = remote;

export const openDialog = (type, message) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();

  return dialog.showMessageBoxSync(focusedWindow, {
    title: type,
    type: type,
    buttons: ['OK'],
    detail: message,
  });
};

export const showOpenDialog = () => {
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
