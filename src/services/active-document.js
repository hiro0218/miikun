export const replaceActiveDocument = ({ editor, store, path, content }) => {
  editor.setValue(content);
  markActiveDocumentSaved({ editor, store, path });
};

export const markActiveDocumentSaved = ({ editor, store, path }) => {
  store.dispatch('initFilePath', path);
  editor.clearHistory();
};

export const clearActiveDocument = ({ editor, store }) => {
  editor.clean();
  store.dispatch('initFilePath', '');
};
