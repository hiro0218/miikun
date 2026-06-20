import debounce from 'debounce';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import fs from '@/adapters/filesystem';
import { getSelectedResult, openDialog, openLinkExternal, showFileOpenDialog } from '@/adapters/electron';
import EditorAdapter from '@/adapters/editor';
import DropField from '@/components/DropField';
import KeyPrompt from '@/components/KeyPrompt';
import TabBar from '@/components/TabBar';
import { UnexpectedStateError } from '@/shared/errors';
import {
  activateTab,
  createUntitledTab,
  markDocumentSaved,
  openDocumentInNewTab,
  removeTab,
} from '@/services/active-document';
import { registerEditorCommands } from '@/services/editor-commands';
import {
  openEncryptedFile as openEncryptedFileOperation,
  openPlainFile as openPlainFileOperation,
  saveEncryptedFile,
  savePlainFile,
  selectDocumentSavePath,
} from '@/services/file-operation';
import { getLinkWithTitle } from '@/services/link-title';
import { getKey, setKey } from '@/services/open-documents';
import RenderPipeline from '@/services/render-pipeline';
import { useStore } from '@/store';

import './Editor.scss';

export default function Editor() {
  const store = useStore();
  const editorElementRef = useRef(null);
  const editorRef = useRef(null);
  const renderPipelineRef = useRef(new RenderPipeline());
  const saveTimerRef = useRef(-1);
  const pendingCloseTabIdRef = useRef(null);
  const emptyStateTabIdsRef = useRef([]);
  const isActiveDocEmptyRef = useRef(true);
  const [htmlCode, setHtmlCode] = useState('');
  const [isActiveDocEmpty, setIsActiveDocEmpty] = useState(true);
  const [emptyStateTabIds, setEmptyStateTabIdsState] = useState([]);

  const { code, isPreview, showLineNumbers, tabs, activeTabId, crypt } = store.state.Editor;
  const path = store.getters.filePath;
  const hasNoTabs = tabs.length === 0;
  const shouldShowActiveTabEmptyState =
    activeTabId != null && emptyStateTabIds.includes(activeTabId) && !path && isActiveDocEmpty;
  const showEmptyState = !crypt.enable && (hasNoTabs || shouldShowActiveTabEmptyState);
  const canUsePreview = !showEmptyState && activeTabId != null;

  const setEmptyStateTabIds = useCallback((updater) => {
    setEmptyStateTabIdsState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      emptyStateTabIdsRef.current = next;
      return next;
    });
  }, []);

  const setActiveDocEmpty = useCallback((value) => {
    isActiveDocEmptyRef.current = value;
    setIsActiveDocEmpty(value);
  }, []);

  const isKeyPromptOpen = useCallback(() => store.state.Editor.crypt.enable, [store]);

  const showEmptyStateNow = useCallback(() => {
    const editorState = store.state.Editor;
    const activePath = store.getters.filePath;
    const shouldShowActive =
      editorState.activeTabId != null &&
      emptyStateTabIdsRef.current.includes(editorState.activeTabId) &&
      !activePath &&
      isActiveDocEmptyRef.current;

    return !editorState.crypt.enable && (editorState.tabs.length === 0 || shouldShowActive);
  }, [store]);

  const canUsePreviewNow = useCallback(() => {
    return !showEmptyStateNow() && store.state.Editor.activeTabId != null;
  }, [showEmptyStateNow, store]);

  const renderPreview = useCallback(async (nextCode) => {
    await renderPipelineRef.current.requestRender(nextCode, (html) => {
      setHtmlCode(html);
    });
  }, []);

  const syncUndoRedoState = useCallback(
    (cm) => {
      const { undo, redo } = cm.historySize();
      store.dispatch('setCanUndo', undo > 0);
      store.dispatch('setCanRedo', redo > 0);
    },
    [store],
  );

  const syncActiveDocumentView = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    syncUndoRedoState(editor.cm);
    const current = editor.cm.getValue();
    setActiveDocEmpty(current.length === 0);
    store.dispatch('updateCode', current);
    renderPipelineRef.current.discardPendingResults();
    setHtmlCode('');

    if (store.state.Editor.isPreview && canUsePreviewNow()) {
      renderPreview(current);
    }

    if (store.state.Editor.activeTabId != null) {
      editor.focus();
    }
  }, [canUsePreviewNow, renderPreview, setActiveDocEmpty, store, syncUndoRedoState]);

  const dismissEmptyStateForActiveTab = useCallback(() => {
    setEmptyStateTabIds((ids) => ids.filter((id) => id !== store.state.Editor.activeTabId));
  }, [setEmptyStateTabIds, store]);

  const onEditorCodeChange = useMemo(
    () =>
      debounce(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const newCode = editor.cm.getValue();
        store.dispatch('updateCode', newCode);

        if (store.state.Editor.isPreview && canUsePreviewNow()) {
          renderPreview(newCode);
        }
      }, 200),
    [canUsePreviewNow, renderPreview, store],
  );

  const onTabSelect = useCallback(
    async (tabId) => {
      const editor = editorRef.current;
      if (!editor) return;

      if (activateTab({ editor, store, tabId })) {
        syncActiveDocumentView();
      } else if (store.state.Editor.activeTabId != null) {
        editor.focus();
      }
    },
    [store, syncActiveDocumentView],
  );

  const cycleTab = useCallback(
    (step) => {
      const editorState = store.state.Editor;
      if (editorState.tabs.length < 2) return;

      const index = editorState.tabs.findIndex((tab) => tab.id === editorState.activeTabId);
      const next = editorState.tabs[(index + step + editorState.tabs.length) % editorState.tabs.length];
      onTabSelect(next.id);
    },
    [onTabSelect, store],
  );

  const savePlainFileForTab = useCallback(
    async (savePath, tabId = store.state.Editor.activeTabId) => {
      const content = editorRef.current.cm.getValue();
      const result = await savePlainFile({
        path: savePath,
        content,
      });

      if (result) {
        markDocumentSaved({
          editor: editorRef.current,
          store,
          tabId,
          path: savePath,
          content,
        });
      }

      return result;
    },
    [store],
  );

  const applySavedFile = useCallback(
    (savePath, key = null, tabId = store.state.Editor.activeTabId, content = editorRef.current.cm.getValue()) => {
      markDocumentSaved({
        editor: editorRef.current,
        store,
        tabId,
        path: savePath,
        content,
      });
      if (key != null && tabId != null) {
        setKey(tabId, key);
      }
    },
    [store],
  );

  const saveEncryptedFileForTab = useCallback(
    async (savePath, key = null, tabId = store.state.Editor.activeTabId) => {
      const content = editorRef.current.cm.getValue();
      const result = await saveEncryptedFile({
        path: savePath,
        content,
        key,
      });

      if (result) {
        applySavedFile(savePath, key, tabId, content);
      }

      return result;
    },
    [applySavedFile, store],
  );

  const openKeyPrompt = useCallback(
    (name = null, keyPath = null) => {
      store.dispatch('setCryptOP', { name, path: keyPath, tabId: store.state.Editor.activeTabId });
      store.dispatch('setCryptKey', '');
      store.dispatch('setCryptEnable', true);
    },
    [store],
  );

  const saveFile = useCallback(async () => {
    const editorState = store.state.Editor;
    if (editorState.activeTabId == null) return false;

    const isNewFile = !store.getters.filePath;
    let savePath = store.getters.filePath;

    if (!savePath) {
      savePath = selectDocumentSavePath();
      if (!savePath) return false;
    }

    const key = getKey(editorState.activeTabId);
    if (fs.shouldEncrypt(savePath) && (isNewFile || !key)) {
      openKeyPrompt('save', savePath);
      return false;
    }

    if (!fs.shouldEncrypt(savePath)) {
      return savePlainFileForTab(savePath, editorState.activeTabId);
    }

    return saveEncryptedFileForTab(savePath, key, editorState.activeTabId);
  }, [openKeyPrompt, saveEncryptedFileForTab, savePlainFileForTab, store]);

  const saveAs = useCallback(async () => {
    const editorState = store.state.Editor;
    if (editorState.activeTabId == null) return false;

    const savePath = selectDocumentSavePath();

    if (!savePath) return false;

    if (fs.shouldEncrypt(savePath)) {
      openKeyPrompt('save', savePath);
      return false;
    }

    return savePlainFileForTab(savePath, editorState.activeTabId);
  }, [openKeyPrompt, savePlainFileForTab, store]);

  const saveModifyFile = useCallback(async () => {
    if (editorRef.current.isClean()) {
      return true;
    }

    const response = getSelectedResult({
      title: '',
      type: 'warning',
      buttons: ['Yes', 'No', 'Cancel'],
      message: store.getters.filePath || 'Untitled',
      detail: 'Would you like to save changes?',
    });

    if (response === 0) {
      return saveFile();
    }

    return response !== 2;
  }, [saveFile, store]);

  const onTabClose = useCallback(
    async (tabId) => {
      if (tabId == null) return;
      await onTabSelect(tabId);

      const canContinue = await saveModifyFile();
      if (isKeyPromptOpen() && store.state.Editor.crypt.op.name === 'save') {
        pendingCloseTabIdRef.current = tabId;
        return;
      }
      if (!canContinue) return;

      removeTab({ editor: editorRef.current, store, tabId });
      setEmptyStateTabIds((ids) => ids.filter((id) => id !== tabId));
      syncActiveDocumentView();
    },
    [isKeyPromptOpen, onTabSelect, saveModifyFile, setEmptyStateTabIds, store, syncActiveDocumentView],
  );

  const newFile = useCallback(() => {
    const id = createUntitledTab({ editor: editorRef.current, store });
    setEmptyStateTabIds((ids) => [...ids, id]);
    syncActiveDocumentView();
  }, [setEmptyStateTabIds, store, syncActiveDocumentView]);

  const activateEmptyStatePrimaryAction = useCallback(() => {
    if (store.state.Editor.tabs.length === 0) {
      createUntitledTab({ editor: editorRef.current, store });
      syncActiveDocumentView();
      return;
    }

    dismissEmptyStateForActiveTab();
    editorRef.current.focus();
  }, [dismissEmptyStateForActiveTab, store, syncActiveDocumentView]);

  const openPlainFile = useCallback(
    (openPath) => {
      return openPlainFileOperation({
        path: openPath,
        currentPath: store.getters.filePath,
        onOpened: (content) => {
          openDocumentInNewTab({
            editor: editorRef.current,
            store,
            path: openPath,
            content,
          });
          syncActiveDocumentView();
        },
      });
    },
    [store, syncActiveDocumentView],
  );

  const openEncryptedFile = useCallback(
    (openPath, key) => {
      return openEncryptedFileOperation({
        path: openPath,
        currentPath: store.getters.filePath,
        key,
        onOpened: (content) => {
          openDocumentInNewTab({
            editor: editorRef.current,
            store,
            path: openPath,
            content,
            key,
          });
          syncActiveDocumentView();
        },
      });
    },
    [store, syncActiveDocumentView],
  );

  const openFilePath = useCallback(
    async (openPath) => {
      if (isKeyPromptOpen()) return false;
      if (typeof openPath !== 'string' || openPath === '') return false;

      const existing = store.state.Editor.tabs.find((tab) => tab.path === openPath);
      if (existing) {
        await onTabSelect(existing.id);
        return true;
      }

      if (fs.shouldEncrypt(openPath)) {
        openKeyPrompt('open', openPath);
        return false;
      }

      return openPlainFile(openPath);
    },
    [isKeyPromptOpen, onTabSelect, openKeyPrompt, openPlainFile, store],
  );

  const openFile = useCallback(async () => {
    const files = showFileOpenDialog();

    if (files) {
      await openFilePath(files[0]);
    }
  }, [openFilePath]);

  const clearKeyPromptState = useCallback(() => {
    store.dispatch('setCryptKey', '');
    store.dispatch('setCryptOP', { name: null, path: null, tabId: null });
  }, [store]);

  const confirmWindowClose = useCallback(
    (event) => {
      const dirtyCount = store.state.Editor.tabs.filter((tab) => tab.isDirty).length;
      const hasNoUnsavedChanges = dirtyCount === 0 && editorRef.current.isClean();
      if (hasNoUnsavedChanges) return;

      const displayCount = dirtyCount > 0 ? dirtyCount : 1;
      const response = getSelectedResult({
        title: '',
        type: 'warning',
        buttons: ['Cancel', 'Quit'],
        message: `${displayCount} tab(s) have unsaved changes`,
        detail: 'Unsaved changes will be lost. Quit anyway?',
      });
      if (response === 0) {
        event.preventDefault();
        event.returnValue = 'Unsaved changes will be lost.';
        return 'Unsaved changes will be lost.';
      }
      return undefined;
    },
    [store],
  );

  const onKeyPromptDone = useCallback(
    async (key) => {
      const op = store.state.Editor.crypt.op;
      const { name, path: opPath } = op;

      if (key === null || key === '') {
        pendingCloseTabIdRef.current = null;
        clearKeyPromptState();
        return;
      }

      if (name === 'open') {
        await openEncryptedFile(opPath, key);
      } else if (name === 'save') {
        if (op.tabId !== store.state.Editor.activeTabId) {
          openDialog('error', new UnexpectedStateError('crypt.op.tabId', op.tabId).toString());
          pendingCloseTabIdRef.current = null;
          clearKeyPromptState();
          return;
        }
        const saved = await saveEncryptedFileForTab(opPath, key, op.tabId);
        if (saved && pendingCloseTabIdRef.current === op.tabId) {
          removeTab({ editor: editorRef.current, store, tabId: op.tabId });
          setEmptyStateTabIds((ids) => ids.filter((id) => id !== op.tabId));
          syncActiveDocumentView();
        }
      } else {
        const err = new UnexpectedStateError('crypt.op.name', name);
        openDialog('error', err.toString());
      }
      pendingCloseTabIdRef.current = null;
      clearKeyPromptState();
    },
    [
      clearKeyPromptState,
      openEncryptedFile,
      saveEncryptedFileForTab,
      setEmptyStateTabIds,
      store,
      syncActiveDocumentView,
    ],
  );

  const onTabReorder = useCallback(
    ({ id, targetId, after }) => {
      store.dispatch('moveTab', { id, targetId, after });
    },
    [store],
  );

  useEffect(() => {
    store.dispatch('setCanPreview', canUsePreview);
    if (!canUsePreview && store.state.Editor.isPreview) {
      store.dispatch('updateIsPreview', false);
    }
  }, [canUsePreview, store]);

  useEffect(() => {
    if (!isPreview) return;
    renderPreview(store.state.Editor.code);
  }, [isPreview, renderPreview, store]);

  useEffect(() => {
    editorRef.current?.setLineNumbers(showLineNumbers);
  }, [showLineNumbers]);

  useEffect(() => {
    const editor = new EditorAdapter(editorElementRef.current, {
      showLineNumbers: store.state.Editor.showLineNumbers,
    });
    editorRef.current = editor;

    editor.cm.on('change', () => {
      const docLength = editor.getDocLength();
      setActiveDocEmpty(docLength === 0);
      if (docLength > 0) {
        dismissEmptyStateForActiveTab();
      }
      onEditorCodeChange();
    });

    editor.cm.on('changes', (cm) => {
      syncUndoRedoState(cm);
      if (store.state.Editor.activeTabId != null) {
        store.dispatch('setTabDirty', { id: store.state.Editor.activeTabId, isDirty: !editor.isClean() });
      }
    });

    editor.cm.on('paste', async (cm, event) => {
      const line = cm.getCursor().line;
      const ch = cm.getCursor().ch;
      const formattedString = await getLinkWithTitle(event);
      editor.insertTextToEditor(formattedString, line, ch);
    });

    editor.cm.on('blur', () => {
      if (saveTimerRef.current === -1) return;
      clearInterval(saveTimerRef.current);
      saveTimerRef.current = -1;
    });

    const guarded = (fn) => {
      return (...args) => {
        if (isKeyPromptOpen()) return;
        fn(...args);
      };
    };

    registerEditorCommands({
      undo: guarded(() => editorRef.current.cm.undo()),
      redo: guarded(() => editorRef.current.cm.redo()),
      setHeadingLevel: guarded((level) => editorRef.current.cm.setHeadingLevel(level)),
      toggleBold: guarded(() => editorRef.current.cm.toggleBold()),
      insertLink: guarded(() => editorRef.current.cm.insertLink()),
      toggleBulletList: guarded(() => editorRef.current.cm.toggleBulletList()),
      newFile: guarded(() => newFile()),
      openFile: guarded(() => openFile()),
      saveFile: guarded(() => saveFile()),
      saveAs: guarded(() => saveAs()),
      closeTab: guarded(() => onTabClose(store.state.Editor.activeTabId)),
      nextTab: guarded(() => cycleTab(1)),
      prevTab: guarded(() => cycleTab(-1)),
    });

    window.addEventListener('beforeunload', confirmWindowClose);
    openLinkExternal();

    return () => {
      window.removeEventListener('beforeunload', confirmWindowClose);
      onEditorCodeChange.clear();
      editorRef.current?.view?.destroy?.();
    };
  }, [
    confirmWindowClose,
    cycleTab,
    dismissEmptyStateForActiveTab,
    isKeyPromptOpen,
    newFile,
    onEditorCodeChange,
    onTabClose,
    openFile,
    saveAs,
    saveFile,
    setActiveDocEmpty,
    store,
    syncUndoRedoState,
  ]);

  return (
    <div className="editor-container">
      <TabBar onSelect={onTabSelect} onClose={onTabClose} onNewTab={newFile} onReorder={onTabReorder} />
      <div className="panes">
        <div className={`input${isPreview ? '' : ' open'}`}>
          <textarea ref={editorElementRef} defaultValue={code} />
        </div>
        {isPreview ? (
          <div className="preview">
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: htmlCode }} />
          </div>
        ) : null}
        {showEmptyState ? (
          <div className="empty-state">
            <div className="empty-state__panel">
              <h2 className="empty-state__title">Start a document</h2>
              <div className="empty-state__actions">
                <button
                  type="button"
                  className="empty-state__button empty-state__button--primary"
                  onClick={activateEmptyStatePrimaryAction}
                >
                  Start writing
                </button>
                <button type="button" className="empty-state__button" onClick={openFile}>
                  Open file&hellip;
                </button>
              </div>
              <p className="empty-state__hint">Drop .md, .txt, or .mii files to open</p>
            </div>
          </div>
        ) : null}
      </div>
      <DropField onOpenFilePath={openFilePath} />
      <KeyPrompt onDone={onKeyPromptDone} />
    </div>
  );
}
