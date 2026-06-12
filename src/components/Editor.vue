<template>
  <div class="editor-container">
    <div :class="{ open: !isPreview }" class="input">
      <textarea ref="editor" v-model="code" />
    </div>
    <div v-if="isPreview == true" class="preview"><div class="markdown-body" v-html="htmlCode" /></div>
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
import { UnexpectedStateError } from '@/shared/errors';
import { clearActiveDocument, markActiveDocumentSaved, replaceActiveDocument } from '@/services/active-document';
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
  },
  data() {
    return {
      editor: null,
      renderPipeline: new RenderPipeline(),
      htmlCode: '',
      saveTimer: -1,
    };
  },
  computed: {
    title: function () {
      const marker = this.canUndo ? '*' : '';
      return `${marker} ${this.path}`;
    },
    ...mapState({
      path: (state) => state.Editor.filePath,
      code: (state) => state.Editor.code,
      isPreview: (state) => state.Editor.isPreview,
      canUndo: (state) => state.Editor.canUndo,
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
  methods: {
    initialize() {
      this.editor = new Editor(this.$refs.editor);

      this.editor.cm.on('change', (cm) => {
        const value = cm.getValue();
        this.onEditorCodeChange(value);
      });

      this.editor.cm.on('changes', (cm) => {
        const { undo, redo } = cm.historySize();
        this.$store.dispatch('setCanUndo', undo > 0);
        this.$store.dispatch('setCanRedo', redo > 0);
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

      this.onEditorReady();
      openLinkExternal();
    },
    onEditorReady() {
      registerEditorCommands({
        undo: () => {
          this.editor.cm.undo();
        },
        redo: () => {
          this.editor.cm.redo();
        },
        newFile: () => {
          this.newFile();
        },
        openFile: () => {
          this.openFile();
        },
        saveFile: () => {
          this.saveFile();
        },
        saveAs: () => {
          this.saveAs();
        },
      });
    },
    async renderPreview(code) {
      await this.renderPipeline.requestRender(code, (html) => {
        this.htmlCode = html;
      });
    },
    onEditorCodeChange: debounce(function (newCode) {
      this.$store.dispatch('updateCode', newCode);

      if (this.code && this.isPreview) {
        this.renderPreview(newCode);
      }
    }, 200),
    async saveModifyFile() {
      if (this.editor.isClean()) {
        return true;
      }

      // 新規・既存：編集済み
      const response = getSelectedResult({
        title: '',
        type: 'warning',
        buttons: ['Yes', 'No', 'Cancel'],
        message: this.path,
        detail: 'Would you like to save changes?',
      });

      if (response === 0) {
        // Yes
        return this.saveFile();
      }

      return response !== 2;
    },
    async newFile() {
      const canContinue = await this.saveModifyFile();
      if (!canContinue) return;

      this.renderPipeline.discardPendingResults();
      this.htmlCode = '';
      clearActiveDocument({
        editor: this.editor,
        store: this.$store,
      });
    },
    async openFile() {
      const files = showFileOpenDialog();

      if (files) {
        await this.openFilePath(files[0]);
      }
    },
    async openFilePath(path) {
      if (typeof path !== 'string' || path === '') return false;

      // 編集済み：保存するか確認ダイアログを表示する
      const canContinue = await this.saveModifyFile();
      if (!canContinue) return false;

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
          this.applyOpenedFile(path, content);
        },
      });
    },
    applyOpenedFile(path, content) {
      replaceActiveDocument({
        editor: this.editor,
        store: this.$store,
        path,
        content,
      });
    },
    async saveFile() {
      const isNewFile = !this.path;
      let savePath = this.path;

      if (!savePath) {
        savePath = selectDocumentSavePath();
        if (!savePath) return false;
      }

      if (fs.shouldEncrypt(savePath) && (isNewFile || !fs.hasKey())) {
        this.openKeyPrompt('save', savePath);
        return false;
      }

      if (!fs.shouldEncrypt(savePath)) {
        return this.savePlainFile(savePath);
      }

      return this.saveEncryptedFile(savePath);
    },
    async saveAs() {
      const savePath = selectDocumentSavePath();

      if (!savePath) return false;

      if (fs.shouldEncrypt(savePath)) {
        this.openKeyPrompt('save', savePath);
        return false;
      }

      return this.savePlainFile(savePath);
    },
    async savePlainFile(path) {
      const result = await savePlainFile({
        path,
        content: this.editor.cm.getValue(),
      });

      if (result) {
        this.applySavedFile(path);
      }

      return result;
    },
    applySavedFile(path) {
      markActiveDocumentSaved({
        editor: this.editor,
        store: this.$store,
        path,
      });
    },
    async saveEncryptedFile(path, key = null) {
      const result = await saveEncryptedFile({
        path,
        content: this.editor.cm.getValue(),
        key,
      });

      if (result) {
        this.applySavedFile(path);
      }

      return result;
    },
    openKeyPrompt(name = null, path = null) {
      // Because the "key input" is an async behavior,
      // we need to remember what to do after it's done.
      // Any better method ?
      this.$store.dispatch('setCryptOP', { name: name, path: path });
      this.$store.dispatch('setCryptKey', '');
      this.$store.dispatch('setCryptEnable', true);
    },
    clearKeyPromptState() {
      this.$store.dispatch('setCryptKey', '');
      this.$store.dispatch('setCryptOP', { name: null, path: null });
    },
    async onKeyPromptDone(key) {
      const name = this.$store.state.Editor.crypt.op.name;
      const path = this.$store.state.Editor.crypt.op.path;

      if (key === null || key === '') {
        this.clearKeyPromptState();
        return;
      }

      // Opening encrypted files and saving with a new key resume here.
      if (name === 'open') {
        await this.openEncryptedFile(path, key);
      } else if (name === 'save') {
        await this.saveEncryptedFile(path, key);
      } else {
        const err = new UnexpectedStateError('crypt.op.name', name);
        openDialog('error', err.toString());
      }
      this.clearKeyPromptState();
    },
  },
};
</script>

<style lang="scss" scoped>
.editor-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  .toolbar.open + & {
    width: calc(100vw - #{$toolbar-width});
  }
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
