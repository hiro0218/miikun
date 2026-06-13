import * as openDocuments from '@/services/open-documents';

const stashActiveTab = ({ editor, store }) => {
  const id = store.state.Editor.activeTabId;
  if (id == null) return;
  openDocuments.stashSnapshot(id, editor.captureDoc());
};

export const createUntitledTab = ({ editor, store }) => {
  stashActiveTab({ editor, store });
  const id = openDocuments.createSession();
  editor.openFresh('');
  store.dispatch('addTab', { id, path: '' });
};

export const openDocumentInNewTab = ({ editor, store, path, content, key = null }) => {
  stashActiveTab({ editor, store });
  const id = openDocuments.createSession(key);
  editor.openFresh(content);
  store.dispatch('addTab', { id, path });
};

export const activateTab = ({ editor, store, tabId }) => {
  if (tabId === store.state.Editor.activeTabId) return false;
  const snapshot = openDocuments.takeSnapshot(tabId);
  if (!snapshot) {
    console.error(`activateTab: snapshot missing for tabId=${tabId} — this is a logic error`);
    return false;
  }
  stashActiveTab({ editor, store });
  editor.restoreDoc(snapshot);
  store.dispatch('activateTab', tabId);
  return true;
};

export const removeTab = ({ editor, store, tabId }) => {
  const tabs = store.state.Editor.tabs;
  const index = tabs.findIndex((t) => t.id === tabId);
  const neighbor = tabs[index + 1] || tabs[index - 1];

  openDocuments.removeSession(tabId);
  store.dispatch('removeTab', tabId);

  if (neighbor) {
    const snapshot = openDocuments.takeSnapshot(neighbor.id);
    if (snapshot) {
      editor.restoreDoc(snapshot);
      store.dispatch('activateTab', neighbor.id);
      return;
    }
  }

  createUntitledTab({ editor, store });
};

// A clean (non-dirty) tab holding `path` is stale once another tab saves over
// that file, so it is closed; a dirty duplicate keeps its rescuable edits.
const removeStaleDuplicate = ({ store, path, activeTabId }) => {
  const currentActiveTabId = store.state.Editor.activeTabId;
  const other = store.state.Editor.tabs.find(
    (tab) => tab.path === path && tab.id !== activeTabId && tab.id !== currentActiveTabId,
  );
  if (other && !other.isDirty) {
    openDocuments.removeSession(other.id);
    store.dispatch('removeTab', other.id);
  }
};

export const markDocumentSaved = ({ editor, store, tabId, path, content }) => {
  if (tabId == null) return;

  removeStaleDuplicate({ store, path, activeTabId: tabId });
  store.dispatch('setTabPath', { id: tabId, path });

  if (tabId === store.state.Editor.activeTabId) {
    const savedCurrentContent = editor.cm.getValue() === content;
    if (savedCurrentContent) {
      editor.clearHistory();
      store.dispatch('setCanUndo', false);
      store.dispatch('setCanRedo', false);
    }
    store.dispatch('setTabDirty', { id: tabId, isDirty: !savedCurrentContent });
    return;
  }

  const savedSnapshotContent = openDocuments.markSnapshotCleanIfContentMatches(tabId, content);
  store.dispatch('setTabDirty', { id: tabId, isDirty: !savedSnapshotContent });
};

export const markActiveDocumentSaved = ({ editor, store, path, content }) => {
  markDocumentSaved({
    editor,
    store,
    tabId: store.state.Editor.activeTabId,
    path,
    content: content ?? editor.cm.getValue(),
  });
};
