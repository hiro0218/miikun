<template>
  <div class="container">
    <div :class="{open:!isPreview}" class="input">
      <codemirror ref="editor"
                  :code="code"
                  :options="editorOptions"
                  @ready="onEditorReady"
                  @focus="onEditorFocus"
                  @input="onEditorCodeChange"/>
    </div>
    <div v-if="isPreview == true" class="preview">
      <div class="markdown-body" v-html="input"/>
    </div>
    <DropField/>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import fs from '@/modules/Filesystem.js';
import { ERR_USER_CANCEL } from '@/modules/Errors';
import { initMarkdown } from '@/modules/markdown.js';
import { getSavePath, getSelectedResult } from '@/modules/dialog.js';
import EditorOption from '@/modules/editor.js';
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
      editorOptions: EditorOption(),
      markdown: null,
      isPreview: true,
      input: '',
      path: '',
    };
  },
  computed: {
    editor() {
      return this.$refs.editor.codemirror;
    },
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

    this.markdown = initMarkdown();
    this.openLinkExternal();
  },
  methods: {
    togglePreview() {
      this.isPreview = !this.isPreview;
    },
    onEditorReady(editor) {
      // console.log('the editor is readied!', editor)
    },
    onEditorFocus(editor) {
      // console.log('the editor is focus!', editor)
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
      const editor = this.editor;

      // is newFile
      if (!this.path && editor.isClean()) {
        return;
      }

      // is not modify
      if (this.path && !editor.isClean()) {
        this.clean();
        return;
      }

      let response = this.modifyDialog();
      switch (response) {
        // Yes
        case 0:
          this.saveFile();
          break;
        // No
        case 1:
          this.clean();
          break;
      }
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
            self.readFile(item[0]);
          }
        },
      );
    },
    readFile(path) {
      const self = this;

      fs.readFile(path, function(err, content) {
        if (err === null) {
          self.setEditor(content);
          self.setPath(path);
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
      const self = this;
      let savePath = this.saveAsDialog();

      if (savePath) {
        self.setPath(savePath);
        let result = self.writeFile();
        if (result) {
          this.editor.markClean();
          this.editor.clearHistory();
        }
      }
    },
    writeFile() {
      const self = this;

      try {
        let error;

        fs.writeFile(self.path, self.code, function(err) {
          error = err;
        });

        if (!error) {
          return true;
        }
      } catch (e) {
        if (e.code !== ERR_USER_CANCEL) {
          self.openDialog('error', e);
        }
        return false;
      }

      return false;
    },
    setPath(path) {
      this.path = path;
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
      const window = electron.remote.getCurrentWindow();

      document.addEventListener('click', function(e) {
        let target = e.target;
        let href = target.getAttribute('href');

        if (target.tagName !== 'A' && !href) {
          return;
        }

        if (href.substring(0, 4) === 'http') {
          e.preventDefault();
          // get status
          let status = window.isAlwaysOnTop();
          // on top
          window.setAlwaysOnTop(true);
          // open link
          electron.shell.openExternal(target.href);
          // restore
          if (!status) {
            setTimeout(function() {
              window.setAlwaysOnTop(false);
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
