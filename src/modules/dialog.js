import electron from 'electron';
const { remote } = electron;
const { dialog } = remote;

export const openDialog = (type, message) => {
  const browserWindow = remote.BrowserWindow;
  const focusedWindow = browserWindow.getFocusedWindow();

  return dialog.showMessageBox(focusedWindow, {
    title: type,
    type: type,
    buttons: ['OK'],
    detail: message,
  });
};

export const getSavePath = extensions => {
  const browserWindow = remote.BrowserWindow;
  const focusedWindow = browserWindow.getFocusedWindow();

  return dialog.showSaveDialog(focusedWindow, {
    title: 'Save Dialog',
    filters: extensions,
  });
};

export const getSelectedResult = ({ title, message, type, buttons, detail }) => {
  const browserWindow = remote.BrowserWindow;
  const focusedWindow = browserWindow.getFocusedWindow();

  return dialog.showMessageBoxSync(focusedWindow, {
    title,
    message,
    type,
    buttons,
    detail,
  });
};
