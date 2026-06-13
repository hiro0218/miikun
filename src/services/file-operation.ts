import filesystem from '@/adapters/filesystem';
import { getSavePath, getSelectedResult, openDialog } from '@/adapters/electron';

export const selectDocumentSavePath = () => {
  return getSavePath([
    { name: 'Markdown file', extensions: ['md'] },
    { name: 'Text file', extensions: ['txt'] },
    { name: 'Mii file', extensions: ['mii'] },
  ]);
};

const openFile = ({ path, currentPath, key = null, onOpened }) => {
  return new Promise((resolve) => {
    if (currentPath === path) {
      getSelectedResult({
        title: '',
        type: 'warning',
        buttons: ['Yes'],
        message: path,
        detail: 'This file is already open.',
      });
      resolve(false);
      return;
    }

    try {
      filesystem.readFile(
        path,
        (err, content) => {
          if (err === null) {
            onOpened(content);
            resolve(true);
            return;
          }

          openDialog('error', err.toString());
          resolve(false);
        },
        key,
      );
    } catch (e) {
      openDialog('error', e.toString());
      resolve(false);
    }
  });
};

export const openPlainFile = ({ path, currentPath, onOpened }) => {
  return openFile({ path, currentPath, onOpened });
};

export const openEncryptedFile = ({ path, currentPath, key, onOpened }) => {
  return openFile({ path, currentPath, key, onOpened });
};

const saveFile = ({ path, content, key = null, onSaved = () => {} }) => {
  return new Promise((resolve) => {
    try {
      filesystem.writeFile(
        path,
        content,
        (err) => {
          if (err) {
            openDialog('error', err.toString());
            resolve(false);
            return;
          }

          onSaved();
          resolve(true);
        },
        key,
      );
    } catch (e) {
      openDialog('error', e.toString());
      resolve(false);
    }
  });
};

export const savePlainFile = ({ path, content }) => {
  return saveFile({ path, content });
};

export const saveEncryptedFile = ({ path, content, key = null }) => {
  return saveFile({
    path,
    content,
    key,
    onSaved: () => {
      if (key !== null) {
        filesystem.updateKey(key);
      }
    },
  });
};
