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
import fs from '@/modules/Filesystem.js';
import Markdown from '@/lib/markdown.js';
import { openDialog, showFileOpenDialog, getSavePath, getSelectedResult } from '@/modules/dialog.js';
import Editor from '@/modules/editor.js';
import DropField from '@/components/DropField';
import KeyPrompt from '@/components/KeyPrompt';
import { UnexpectedStateError } from '@/modules/Errors';
import { EventBus } from '@/lib/event-bus';
import { openLinkExternal, getLinkWithTitle } from '@/lib/utils';

export default {
  name: 'MiiEditor',
  components: {
    DropField,
    KeyPrompt,
  },
  data() {
    return {
      editor: null,
      markdown: null,
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
          this.htmlCode = this.markdown.render(this.code);
        });
      },
      immediate: true,
    },
  },
  mounted() {
    this.markdown = new Markdown();

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
        this.editor.updateHistory();
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
      EventBus.$on('undo', () => {
        this.editor.cm.undo();
      });
      EventBus.$on('redo', () => {
        this.editor.cm.redo();
      });
      EventBus.$on('newFile', () => {
        this.newFile();
      });
      EventBus.$on('openFile', () => {
        this.openFile();
      });
      EventBus.$on('saveFile', () => {
        this.saveFile();
      });
      EventBus.$on('saveAs', () => {
        this.saveAs();
      });
    },
    onEditorCodeChange: debounce(function (newCode) {
      this.$store.dispatch('updateCode', newCode);

      if (this.code && this.isPreview) {
        this.htmlCode = this.markdown.render(newCode);
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

      this.htmlCode = '';
      this.editor.clean();
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
      } else {
        this.readFile(path);
      }

      return true;
    },
    readFile(path) {
      if (this.path === path) {
        getSelectedResult({
          title: '',
          type: 'warning',
          buttons: ['Yes'],
          message: path,
          detail: 'This file is already open.',
        });
        return;
      }

      fs.readFile(path, (err, content) => {
        if (err === null) {
          this.editor.setValue(content);
          this.editor.initFilePath(path);
          this.editor.clearHistory();
        } else {
          openDialog('error', err.toString());
        }
      });
    },
    saveAsDialog() {
      const savePath = getSavePath([
        { name: 'Markdown file', extensions: ['md'] },
        { name: 'Text file', extensions: ['txt'] },
        { name: 'Mii file', extensions: ['mii'] },
      ]);

      return savePath;
    },
    async saveFile() {
      const isNewFile = !this.path;
      let savePath = this.path;

      if (!savePath) {
        savePath = this.saveAsDialog();
        if (!savePath) return false;
      }

      if (fs.shouldEncrypt(savePath) && isNewFile) {
        this.openKeyPrompt('save', savePath);
        return false;
      }

      const result = await this.writeFile(savePath);

      if (result) {
        this.editor.initFilePath(savePath);
        this.editor.clearHistory();
      }

      return result;
    },
    async saveAs() {
      const savePath = this.saveAsDialog();

      if (!savePath) return false;

      if (fs.shouldEncrypt(savePath)) {
        this.openKeyPrompt('save', savePath);
        return false;
      }

      const result = await this.writeFile(savePath);

      if (result) {
        this.editor.initFilePath(savePath);
        this.editor.clearHistory();
      }

      return result;
    },
    writeFile(path = this.path, key = null) {
      return new Promise((resolve) => {
        try {
          fs.writeFile(
            path,
            this.editor.cm.getValue(),
            (err) => {
              if (err) {
                openDialog('error', err.toString());
                resolve(false);
                return;
              }

              if (key !== null) {
                fs.updateKey(key);
              }

              resolve(true);
            },
            key,
          );
        } catch (e) {
          openDialog('error', e.toString());
          resolve(false);
        }
      });
    },
    openKeyPrompt(name = null, path = null) {
      this.$store.dispatch('setCryptEnable', true);
      // Because the "key input" is an async behavior,
      // we need to remember what to do after it's done.
      // Any better method ?
      this.$store.dispatch('setCryptOP', { name: name, path: path });
    },
    async onKeyPromptDone(key) {
      const name = this.$store.state.Editor.crypt.op.name;
      const path = this.$store.state.Editor.crypt.op.path;

      if (key === null || key === '') {
        this.$store.dispatch('setCryptOP', { name: null, path: null });
        return;
      }

      // Opening encrypted files and saving with a new key resume here.
      if (name === 'open') {
        this.readFile(path);
      } else if (name === 'save') {
        const result = await this.writeFile(path, key);
        if (result) {
          this.editor.initFilePath(path);
          this.editor.clearHistory();
        }
      } else {
        const err = new UnexpectedStateError('crypt.op.name', name);
        openDialog('error', err.toString());
      }
      this.$store.dispatch('setCryptOP', { name: null, path: null });
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
