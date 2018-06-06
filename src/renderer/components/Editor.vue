<template>
  <div class="container">
    <div :class="{open:!isPreview}" class="input">
      <codemirror ref="editor"
                  :code="code"
                  :options="editorOptions"
                  @input="onEditorCodeChange"/>
    </div>
    <div v-if="isPreview == true" class="preview">
      <div class="markdown-body" v-html="input"/>
    </div>
    <DropField/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { debounce } from 'lodash';
import fs from '@/modules/Filesystem.js';
import { ERR_USER_CANCEL } from '@/modules/Errors';
import { initMarkdown } from '@/modules/markdown.js';
import { getSavePath, getSelectedResult } from '@/modules/dialog.js';
import editorOptions from '@/modules/editor.js';
import Menu from '@/modules/menu.js';
import DropField from '@/components/DropField';

export default {
  name: 'MiiEditor',
  components: {
    DropField,
  },
  data() {
    return {
      code: '',
      editorOptions,
      markdown: initMarkdown(),
      input: '',
    };
  },
  computed: {
    editor() {
      return this.$refs.editor.codemirror;
    },
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
    Menu.togglePreview = this.togglePreview;
    Menu.newFile = this.newFile;
    Menu.openFile = this.openFile;
    Menu.saveFile = this.saveFile;
    Menu.saveAsFile = this.saveAs;
    Menu.ready();

    this.openLinkExternal();
  },
  methods: {
    togglePreview() {
      this.$store.dispatch('updateIsPreview', !this.isPreview);
    },
    onEditorCodeChange: debounce(function(newCode) {
      this.code = newCode;
      if (this.isPreview) {
        this.input = this.markdown.render(newCode);
      }
    }, 200),
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
    newFile() {
      if (!this.editor.isClean()) {
        // 新規・既存：編集済み
        let response = this.modifyDialog();
        if (response === 0) {
          // Yes
          this.saveFile();
        } else if (response === 2) {
          // Cancel (do nothing)
          return;
        }
      }

      this.clean();
    },
    openFile() {
      const self = this;
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
        function(item) {
          if (item) {
            let path = item[0];
            self.readFile(path);
          }
        },
      );
    },
    readFile(path) {
      const self = this;

      if (this.path === path) {
        getSelectedResult({
          title: '',
          type: 'warning',
          buttons: ['Yes'],
          detail: 'This file is already open.',
        });
        return;
      }

      fs.readFile(path, function(err, content) {
        if (err === null) {
          self.setEditor(content);
          self.setPath(path);
          self.editor.markClean();
          self.editor.clearHistory();
        } else if (err.code !== ERR_USER_CANCEL) {
          self.openDialog('error', err.toString());
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
        let result = this.writeFile();
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
        if (e.code !== ERR_USER_CANCEL) {
          this.openDialog('error', e);
        }
        return false;
      }

      return false;
    },
    setPath(path) {
      this.$store.dispatch('updateFilePath', path);
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
    openLinkExternal() {
      const electron = this.$electron;
      const currentWindow = electron.remote.getCurrentWindow();

      document.addEventListener('click', function(e) {
        let target = e.target;
        let href = target.getAttribute('href');

        if (target.tagName !== 'A' && !href) {
          return;
        }

        if (href.substring(0, 4) === 'http') {
          e.preventDefault();
          // get status
          let status = currentWindow.isAlwaysOnTop();
          // on top
          currentWindow.setAlwaysOnTop(true);
          // open link
          electron.shell.openExternal(target.href);
          // restore
          if (!status) {
            setTimeout(function() {
              currentWindow.setAlwaysOnTop(false);
            }, 1000);
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  margin: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
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

  /deep/ .vue-codemirror,
  /deep/ .CodeMirror {
    height: 100%;
    width: 100%;
  }
}

.preview {
  overflow: auto;
  padding: 0.5rem;
}
</style>
