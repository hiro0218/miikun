<template>
  <div class="editor-container">
    <TabBar @select="onTabSelect" @close="onTabClose" @new-tab="newFile" @reorder="onTabReorder" />
    <div class="panes">
      <div :class="{ open: !isPreview }" class="input">
        <textarea ref="editor" v-model="code" />
      </div>
      <div v-if="isPreview == true" class="preview"><div class="markdown-body" v-html="htmlCode" /></div>
    </div>
    <DropField @open-file-path="openFilePath" />
    <KeyPrompt @done="onKeyPromptDone" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import debounce from 'debounce';
import fs from '@/adapters/filesystem.js';
import { openDialog, showFileOpenDialog, getSelectedResult, openLinkExternal } from '@/adapters/electron.js';
import Editor from '@/adapters/editor.js';
import DropField from '@/components/DropField';
import KeyPrompt from '@/components/KeyPrompt';
import TabBar from '@/components/TabBar';
import { UnexpectedStateError } from '@/shared/errors';
import {
  createUntitledTab,
  openDocumentInNewTab,
  activateTab,
  removeTab,
  markDocumentSaved,
} from '@/services/active-document';
import { getKey, setKey } from '@/services/open-documents';
import { registerEditorCommands } from '@/services/editor-commands';
import {
  openEncryptedFile as openEncryptedFileOperation,
  openPlainFile as openPlainFileOperation,
  saveEncryptedFile,
  savePlainFile,
  selectDocumentSavePath,
} from '@/services/file-operation';
import { getLinkWithTitle } from '@/services/link-title';
import RenderPipeline from '@/services/render-pipeline';

export default {
  name: 'MiiEditor',
  components: {
    DropField,
    KeyPrompt,
    TabBar,
  },
  data() {
    return {
      editor: null,
      renderPipeline: new RenderPipeline(),
      htmlCode: '',
      saveTimer: -1,
      pendingCloseTabId: null,
    };
  },
  computed: {
    path() {
      return this.$store.getters.filePath;
    },
    ...mapState({
      code: (state) => state.Editor.code,
      isPreview: (state) => state.Editor.isPreview,
      tabs: (state) => state.Editor.tabs,
      activeTabId: (state) => state.Editor.activeTabId,
    }),
  },
  watch: {
    isPreview: {
      handler: function (value) {
        if (!value) return;

        this.$nextTick(() => {
          this.renderPreview(this.code);
        });
      },
      immediate: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initialize();
    });
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this._beforeUnloadHandler);
  },
  methods: {
    initialize() {
      this.editor = new Editor(this.$refs.editor);

      this.editor.cm.on('change', () => {
        this.onEditorCodeChange();
      });

      this.editor.cm.on('changes', (cm) => {
        this.syncUndoRedoState(cm);
        if (this.activeTabId != null) {
          this.$store.dispatch('setTabDirty', { id: this.activeTabId, isDirty: !this.editor.isClean() });
        }
      });

      this.editor.cm.on('paste', async (cm, e) => {
        const line = cm.getCursor().line;
        const ch = cm.getCursor().ch;
        const formattedString = await getLinkWithTitle(e);
        this.editor.insertTextToEditor(formattedString, line, ch);
      });

      this.editor.cm.on('blur', (cm) => {
        if (this.saveTimer === -1) return;
        clearInterval(this.saveTimer);
        this.saveTimer = -1;
      });

      createUntitledTab({ editor: this.editor, store: this.$store });
      this._beforeUnloadHandler = (e) => this.confirmWindowClose(e);
      window.addEventListener('beforeunload', this._beforeUnloadHandler);
      this.onEditorReady();
      openLinkExternal();
    },
    onEditorReady() {
      // Native menu accelerators bypass the KeyPrompt overlay, so every command
      // is frozen here while a crypt operation is pending.
      const guarded = (fn) => () => {
        if (this.isKeyPromptOpen()) return;
        fn();
      };
      registerEditorCommands({
        undo: guarded(() => this.editor.cm.undo()),
        redo: guarded(() => this.editor.cm.redo()),
        newFile: guarded(() => this.newFile()),
        openFile: guarded(() => this.openFile()),
        saveFile: guarded(() => this.saveFile()),
        saveAs: guarded(() => this.saveAs()),
        closeTab: guarded(() => this.onTabClose(this.activeTabId)),
        nextTab: guarded(() => this.cycleTab(1)),
        prevTab: guarded(() => this.cycleTab(-1)),
      });
    },
    isKeyPromptOpen() {
      return this.$store.state.Editor.crypt.enable;
    },
    async renderPreview(code) {
      await this.renderPipeline.requestRender(code, (html) => {
        this.htmlCode = html;
      });
    },
    onEditorCodeChange: debounce(function () {
      const newCode = this.editor.cm.getValue();
      this.$store.dispatch('updateCode', newCode);

      if (newCode && this.isPreview) {
        this.renderPreview(newCode);
      }
    }, 200),
    syncUndoRedoState(cm) {
      const { undo, redo } = cm.historySize();
      this.$store.dispatch('setCanUndo', undo > 0);
      this.$store.dispatch('setCanRedo', redo > 0);
    },
    syncActiveDocumentView() {
      this.syncUndoRedoState(this.editor.cm);
      const current = this.editor.cm.getValue();
      this.$store.dispatch('updateCode', current);
      this.renderPipeline.discardPendingResults();
      this.htmlCode = '';
      if (this.isPreview) {
        this.renderPreview(current);
      }
      this.editor.focus();
    },
    async onTabSelect(tabId) {
      if (activateTab({ editor: this.editor, store: this.$store, tabId })) {
        this.syncActiveDocumentView();
      } else {
        this.editor.focus();
      }
    },
    async onTabClose(tabId) {
      // Activate the target tab first so the user sees what saveModifyFile asks about.
      await this.onTabSelect(tabId);
      const canContinue = await this.saveModifyFile();
      if (this.isKeyPromptOpen() && this.$store.state.Editor.crypt.op.name === 'save') {
        this.pendingCloseTabId = tabId;
        return;
      }
      if (!canContinue) return;
      removeTab({ editor: this.editor, store: this.$store, tabId });
      this.syncActiveDocumentView();
    },
    cycleTab(step) {
      if (this.tabs.length < 2) return;
      const index = this.tabs.findIndex((t) => t.id === this.activeTabId);
      const next = this.tabs[(index + step + this.tabs.length) % this.tabs.length];
      this.onTabSelect(next.id);
    },
    onTabReorder({ id, targetId, after }) {
      this.$store.dispatch('moveTab', { id, targetId, after });
    },
    async saveModifyFile() {
      if (this.editor.isClean()) {
        return true;
      }

      const response = getSelectedResult({
        title: '',
        type: 'warning',
        buttons: ['Yes', 'No', 'Cancel'],
        message: this.path || 'Untitled',
        detail: 'Would you like to save changes?',
      });

      if (response === 0) {
        // Yes
        return this.saveFile();
      }

      return response !== 2;
    },
    newFile() {
      createUntitledTab({ editor: this.editor, store: this.$store });
      this.syncActiveDocumentView();
    },
    async openFile() {
      const files = showFileOpenDialog();

      if (files) {
        await this.openFilePath(files[0]);
      }
    },
    async openFilePath(path) {
      if (this.isKeyPromptOpen()) return false;
      if (typeof path !== 'string' || path === '') return false;

      const existing = this.tabs.find((t) => t.path === path);
      if (existing) {
        await this.onTabSelect(existing.id);
        return true;
      }

      if (fs.shouldEncrypt(path)) {
        this.openKeyPrompt('open', path);
        return false;
      } else {
        return this.openPlainFile(path);
      }
    },
    openPlainFile(path) {
      return openPlainFileOperation({
        path,
        currentPath: this.path,
        onOpened: (content) => {
          this.applyOpenedFile(path, content);
        },
      });
    },
    openEncryptedFile(path, key) {
      return openEncryptedFileOperation({
        path,
        currentPath: this.path,
        key,
        onOpened: (content) => {
          this.applyOpenedFile(path, content, key);
        },
      });
    },
    applyOpenedFile(path, content, key = null) {
      openDocumentInNewTab({
        editor: this.editor,
        store: this.$store,
        path,
        content,
        key,
      });
      this.syncActiveDocumentView();
    },
    async saveFile() {
      const isNewFile = !this.path;
      let savePath = this.path;

      if (!savePath) {
        savePath = selectDocumentSavePath();
        if (!savePath) return false;
      }

      const key = getKey(this.activeTabId);
      if (fs.shouldEncrypt(savePath) && (isNewFile || !key)) {
        this.openKeyPrompt('save', savePath);
        return false;
      }

      if (!fs.shouldEncrypt(savePath)) {
        return this.savePlainFile(savePath, this.activeTabId);
      }

      return this.saveEncryptedFile(savePath, key, this.activeTabId);
    },
    async saveAs() {
      const savePath = selectDocumentSavePath();

      if (!savePath) return false;

      if (fs.shouldEncrypt(savePath)) {
        this.openKeyPrompt('save', savePath);
        return false;
      }

      return this.savePlainFile(savePath, this.activeTabId);
    },
    async savePlainFile(path, tabId = this.activeTabId) {
      const content = this.editor.cm.getValue();
      const result = await savePlainFile({
        path,
        content,
      });

      if (result) {
        this.applySavedFile(path, null, tabId, content);
      }

      return result;
    },
    applySavedFile(path, key = null, tabId = this.activeTabId, content = this.editor.cm.getValue()) {
      markDocumentSaved({
        editor: this.editor,
        store: this.$store,
        tabId,
        path,
        content,
      });
      if (key != null && tabId != null) {
        setKey(tabId, key);
      }
    },
    async saveEncryptedFile(path, key = null, tabId = this.activeTabId) {
      const content = this.editor.cm.getValue();
      const result = await saveEncryptedFile({
        path,
        content,
        key,
      });

      if (result) {
        this.applySavedFile(path, key, tabId, content);
      }

      return result;
    },
    openKeyPrompt(name = null, path = null) {
      // Because the "key input" is an async behavior,
      // we need to remember what to do after it's done.
      // Any better method ?
      this.$store.dispatch('setCryptOP', { name, path, tabId: this.activeTabId });
      this.$store.dispatch('setCryptKey', '');
      this.$store.dispatch('setCryptEnable', true);
    },
    clearKeyPromptState() {
      this.$store.dispatch('setCryptKey', '');
      this.$store.dispatch('setCryptOP', { name: null, path: null, tabId: null });
    },
    confirmWindowClose(e) {
      const dirtyCount = this.tabs.filter((tab) => tab.isDirty).length;
      const hasNoUnsavedChanges = dirtyCount === 0 && this.editor.isClean();
      if (hasNoUnsavedChanges) return;
      // dirtyCount may be 0 when the active tab has unsaved changes not yet flushed to tabs state.
      const displayCount = dirtyCount > 0 ? dirtyCount : 1;
      const response = getSelectedResult({
        title: '',
        type: 'warning',
        buttons: ['Cancel', 'Quit'],
        message: `${displayCount} tab(s) have unsaved changes`,
        detail: 'Unsaved changes will be lost. Quit anyway?',
      });
      if (response === 0) e.returnValue = false;
    },
    async onKeyPromptDone(key) {
      const op = this.$store.state.Editor.crypt.op;
      const { name, path } = op;

      if (key === null || key === '') {
        this.pendingCloseTabId = null;
        this.clearKeyPromptState();
        return;
      }

      // Opening encrypted files and saving with a new key resume here.
      if (name === 'open') {
        await this.openEncryptedFile(path, key);
      } else if (name === 'save') {
        if (op.tabId !== this.activeTabId) {
          openDialog('error', new UnexpectedStateError('crypt.op.tabId', op.tabId).toString());
          this.pendingCloseTabId = null;
          this.clearKeyPromptState();
          return;
        }
        const saved = await this.saveEncryptedFile(path, key, op.tabId);
        if (saved && this.pendingCloseTabId === op.tabId) {
          removeTab({ editor: this.editor, store: this.$store, tabId: op.tabId });
          this.syncActiveDocumentView();
        }
      } else {
        const err = new UnexpectedStateError('crypt.op.name', name);
        openDialog('error', err.toString());
      }
      this.pendingCloseTabId = null;
      this.clearKeyPromptState();
    },
  },
};
</script>

<style lang="scss" scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  .toolbar.open + & {
    width: calc(100vw - #{$toolbar-width});
  }
}

.panes {
  display: flex;
  flex: 1;
  min-height: 0;
}

.input,
.preview {
  flex-basis: 50%;
  width: 50%;
}

.input {
  transition:
    flex-basis 0.2s ease-out,
    width 0.2s ease-out;
  &.open {
    flex-basis: 100%;
    width: 100%;
  }

  :deep(.cm-editor) {
    width: 100%;
    height: 100%;
  }
}

.preview {
  overflow: auto;
  border-left: 1px solid var(--border);

  .markdown-body {
    max-width: $content-max-width;
    margin: 0 auto;
    padding: 3rem 1.5rem;
  }
}
</style>
