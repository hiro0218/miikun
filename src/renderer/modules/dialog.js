import electron from 'electron';
const { remote } = electron;
const { dialog } = remote;

export const getSavePath = extensions => {
  const browserWindow = remote.BrowserWindow;
  const focusedWindow = browserWindow.getFocusedWindow();

  return dialog.showSaveDialog(focusedWindow, {
    title: 'Save Dialog',
    filters: extensions,
  });
};

export const getSelectedResult = ({ title, type, buttons, detail }) => {
  const browserWindow = remote.BrowserWindow;
  const focusedWindow = browserWindow.getFocusedWindow();

  return dialog.showMessageBox(focusedWindow, {
    title,
    type,
    buttons,
    detail,
  });
};
