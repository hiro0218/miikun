<template>
  <div class="editor-container">
    <div :class="{ open: !isPreview }" class="input">
      <textarea ref="editor" v-model="code" />
    </div>
    <div v-if="isPreview == true" class="preview"><div class="markdown-body" v-html="input" /></div>
    <DropField />
    <KeyPrompt @done="onKeyPromptDone" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import CodeMirror from 'codemirror';
import { debounce } from 'debounce';
import fs from '@/modules/Filesystem.js';
import { initMarkdown } from '@/modules/markdown.js';
import { getSavePath, getSelectedResult } from '@/modules/dialog.js';
import editorOptions from '@/modules/editor.js';
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
      markdown: initMarkdown(),
      code: '',
      input: '',
    };
  },
  computed: {
    ...mapState({
      path: state => state.Editor.filePath,
      isPreview: state => state.Editor.isPreview,
    }),
  },
  watch: {
    isPreview: function(value) {
      if (value) {
        this.input = this.markdown.render(this.code);
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initialize();
    });
  },
  methods: {
    initialize() {
      this.editor = CodeMirror.fromTextArea(this.$refs.editor, editorOptions);

      this.editor.on('change', cm => {
        const value = cm.getValue();
        this.onEditorCodeChange(value);
      });

      this.editor.on('changes', cm => {
        this.checkEditorHistory();
      });

      this.editor.on('paste', async (_, e) => {
        const line = this.editor.getCursor().line;
        const ch = this.editor.getCursor().ch;
        const formattedString = await getLinkWithTitle(e);
        this.insertTextToEditor(formattedString, line, ch);
      });

      this.onEditorReady();
      openLinkExternal();
    },
    checkEditorHistory() {
      let { undo, redo } = this.editor.historySize();
      this.$store.dispatch('setCanUndo', undo > 0);
      this.$store.dispatch('setCanRedo', redo > 0);
    },
    onEditorReady() {
      EventBus.$on('undo', () => {
        this.editor.undo();
      });
      EventBus.$on('redo', () => {
        this.editor.redo();
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
    onEditorCodeChange: debounce(function(newCode) {
      this.code = newCode;
      if (this.code && this.isPreview) {
        this.input = this.markdown.render(newCode);
      }
    }, 200),
    insertTextToEditor(text, line, ch) {
      if (!text) return;
      console.log(text);
      this.editor.replaceRange(text, { line, ch }, { line, ch });
    },
    openDialog(type, msg) {
      const remote = this.$electron.remote;
      const dialog = remote.dialog;
      const browserWindow = remote.BrowserWindow;
      const focusedWindow = browserWindow.getFocusedWindow();

      dialog.showMessageBox(focusedWindow, {
        title: type,
        type: type,
        buttons: ['OK'],
        detail: msg,
      });
    },
    saveModifyFile() {
      if (this.editor.isClean()) {
        return;
      }

      // 新規・既存：編集済み
      let response = this.modifyDialog();
      if (response === 0) {
        // Yes
        this.saveFile();
      } else if (response === 2) {
        // Cancel (do nothing)
        return;
      }
    },
    newFile() {
      this.saveModifyFile();
      this.clean();
    },
    openFile() {
      const remote = this.$electron.remote;
      const dialog = remote.dialog;
      const browserWindow = remote.BrowserWindow;
      const focusedWindow = browserWindow.getFocusedWindow();

      dialog.showOpenDialog(
        focusedWindow,
        {
          title: 'Open Dialog',
          filters: [
            {
              name: 'Documents',
              extensions: ['txt', 'md', 'mii'],
            },
          ],
          properties: ['openFile'],
        },
        item => {
          if (item) {
            let path = item[0];

            // 編集済み：合保存するか確認ダイアログを表示する
            this.saveModifyFile();
            if (fs.shouldEncrypt(path)) {
              this.openKeyPrompt('open', path);
            } else {
              this.readFile(path);
            }
          }
        },
      );
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
          this.setEditor(content);
          this.setPath(path);
          this.editor.markClean();
          this.editor.clearHistory();
        } else {
          this.openDialog('error', err.toString());
        }
      });
    },
    saveAsDialog() {
      let savePath = getSavePath([
        { name: 'Markdown file', extensions: ['md'] },
        { name: 'Text file', extensions: ['txt'] },
        { name: 'Mii file', extensions: ['mii'] },
      ]);

      return savePath;
    },
    modifyDialog() {
      return getSelectedResult({
        title: '',
        type: 'warning',
        buttons: ['Yes', 'No', 'Cancel'],
        message: this.path,
        detail: 'Wolud you like to save changes?',
      });
    },
    saveFile() {
      let result;

      if (this.path) {
        this.setPath(this.path);
        result = this.writeFile();
      } else {
        let savePath = this.saveAsDialog();
        if (savePath) {
          this.setPath(savePath);
          result = this.writeFile();
        }
      }

      if (result) {
        this.editor.markClean();
        this.editor.clearHistory();
      }
    },
    saveAs() {
      let savePath = this.saveAsDialog();

      if (savePath) {
        this.setPath(savePath);
        let result;
        if (fs.shouldEncrypt(savePath)) {
          this.openKeyPrompt('save', savePath);
        } else {
          result = this.writeFile();
        }

        if (result) {
          this.editor.markClean();
          this.editor.clearHistory();
        }
      }
    },
    writeFile() {
      try {
        let error;

        fs.writeFile(this.path, this.code, function(err) {
          error = err;
        });

        if (!error) {
          return true;
        }
      } catch (e) {
        this.openDialog('error', e);
        return false;
      }

      return false;
    },
    setPath(path) {
      this.$store.dispatch('updateFilePath', path);
      this.$store.dispatch('setCanUndo', false);
      this.$store.dispatch('setCanRedo', false);
    },
    setEditor(value) {
      this.editor.setValue(value);
      this.editor.save();
    },
    clean() {
      this.setEditor('');
      this.setPath('');
      this.editor.markClean();
      this.editor.clearHistory();
    },
    openKeyPrompt(name = null, path = null) {
      this.$store.dispatch('setCryptEnable', true);
      // Because the "key input" is an async behavior,
      // we need to remember what to do after it's done.
      // Any better method ?
      this.$store.dispatch('setCryptOP', { name: name, path: path });
    },
    onKeyPromptDone(key) {
      if (key === null || key === '') {
        return;
      }
      const name = this.$store.state.Editor.crypt.op.name;
      const path = this.$store.state.Editor.crypt.op.path;
      // Currently, only openFile and saveAs need user to enter key.
      // When openFile, fs use cached key which is set when readFile success,
      // so call writeFile instead of openKeyPrompt when save a encrypted file.
      if (name === 'open') {
        this.readFile(path);
      } else if (name === 'save') {
        // the linter force me to use this style ...
        fs.writeFile(
          this.path,
          this.code,
          err => {
            if (err) {
              this.openDialog('error', err.toString());
            } else {
              fs.updateKey(key);
            }
          },
          key,
        );
      } else {
        const err = new UnexpectedStateError('crypt.op.name', name);
        this.openDialog('error', err.toString());
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
  [data-toolbar-open] + & {
    width: calc(100vw - #{$toolbar-width});
  }
}

.input,
.preview {
  flex-basis: 50%;
  width: 50%;
}

.input {
  transition: all 0.2s;
  &.open {
    flex-basis: 100%;
    width: 100%;
  }

  /deep/ .CodeMirror {
    width: 100%;
    height: 100%;
  }
}

.preview {
  padding: 0.5rem;
  overflow: auto;
}
</style>
