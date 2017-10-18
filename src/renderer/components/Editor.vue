<style scoped></style>

<template>
  <div>
    <div class='container'>
      <div class='input' v-bind:class="{open:!isPreview}">
        <codemirror ref="codemirror" :code="code" :options="editorOptions"
                    @ready="onEditorReady"
                    @focus="onEditorFocus"
                    @change="onEditorCodeChange">
        </codemirror>
      </div>
      <div class='preview' v-if="isPreview == true">
        <div class='markdown-body' v-html='input'></div>
      </div>
    </div>
    <div class='dropzone'></div>
  </div>
</template>

<script>
const fs = require('fs')
const Markdown = require('../modules/markdown.js')
const Editor = require('../modules/editor.js')
const Menu = require('../modules/menu.js')
const DragDrop = require('../modules/dragdrop.js')

export default {
  name: 'mii-editor',
  data () {
    return {
      code: '',
      editorOptions: Editor.option(),
      markdown: null,
      isPreview: true,
      input: '',
      path: '',
    }
  },
  mounted () {
    Menu.togglePreview = this.togglePreview
    Menu.newFile = this.newFile
    Menu.openFile = this.openFile
    Menu.saveFile = this.saveFile
    Menu.saveAsFile = this.saveAs
    Menu.ready()

    this.markdown = Markdown.init()
    this.openLinkExternal()

    DragDrop.dropFile = this.dropFile
    DragDrop.ready()
  },
  computed: {
    editor () {
      return this.$refs.codemirror.editor
    },
  },
  methods: {
    togglePreview () {
      this.isPreview = !this.isPreview
    },
    onEditorReady (editor) {
      // console.log('the editor is readied!', editor)
    },
    onEditorFocus (editor) {
      // console.log('the editor is focus!', editor)
    },
    onEditorCodeChange (newCode) {
      this.code = newCode
      if (this.isPreview) {
        this.input = this.markdown.render(newCode)
      }
    },
    openDialog (type, msg) {
      const remote = this.$electron.remote
      const dialog = remote.dialog
      const browserWindow = remote.BrowserWindow
      const focusedWindow = browserWindow.getFocusedWindow()

      dialog.showMessageBox(focusedWindow, {
        title: type,
        type: type,
        buttons: ['OK'],
        detail: msg
      })
    },
    newFile () {
      const editor = this.$refs.codemirror.editor

      // is newFile
      if (!this.path && editor.isClean()) {
        return
      }

      // is not modify
      if (this.path && !editor.isClean()) {
        this.clean()
        return
      }

      let response = this.modifyDialog()
      switch (response) {
        // Yes
        case 0:
          this.saveFile()
          break
        // No
        case 1:
          this.clean()
          break
      }
    },
    openFile () {
      const self = this
      const remote = this.$electron.remote
      const dialog = remote.dialog
      const browserWindow = remote.BrowserWindow
      const focusedWindow = browserWindow.getFocusedWindow()

      dialog.showOpenDialog(focusedWindow, {
        title: 'Open Dialog',
        filters: [{
          name: 'Documents',
          extensions: ['txt', 'md']
        }],
        properties: ['openFile']
      }, function (item) {
        if (item) {
          self.readFile(item[0])
        }
      })
    },
    readFile (path) {
      const self = this

      fs.readFile(path, 'utf8', function (err, content) {
        if (err === null) {
          self.setEditor(content)
          self.setPath(path)
        } else {
          self.openDialog('error', err.toString())
        }
      })
    },
    saveAsDialog () {
      const remote = this.$electron.remote
      const dialog = remote.dialog
      const browserWindow = remote.BrowserWindow
      const focusedWindow = browserWindow.getFocusedWindow()

      let savePath = dialog.showSaveDialog(focusedWindow, {
        title: 'Save Dialog',
        filters: [
          {name: 'Markdown file', extensions: ['md']},
          {name: 'Text file', extensions: ['txt']}
        ]
      })

      return savePath
    },
    modifyDialog () {
      const remote = this.$electron.remote
      const dialog = remote.dialog
      const browserWindow = remote.BrowserWindow
      const focusedWindow = browserWindow.getFocusedWindow()

      let response = dialog.showMessageBox(focusedWindow, {
        title: '',
        type: 'warning',
        buttons: ['Yes', 'No', 'Cancel'],
        detail: 'Wolud you like to save changes?'
      })

      return response
    },
    saveFile () {
      let result

      if (this.path) {
        this.setPath(this.path)
        result = this.writeFile()
      } else {
        let savePath = this.saveAsDialog()
        if (savePath) {
          this.setPath(savePath)
          result = this.writeFile()
        }
      }

      if (result) {
        this.$refs.codemirror.editor.markClean()
        this.$refs.codemirror.editor.clearHistory()
      }
    },
    saveAs () {
      const self = this
      let savePath = this.saveAsDialog()

      if (savePath) {
        self.setPath(savePath)
        let result = self.writeFile()
        if (result) {
          this.$refs.codemirror.editor.markClean()
          this.$refs.codemirror.editor.clearHistory()
        }
      }
    },
    writeFile () {
      const self = this

      try {
        let error

        fs.writeFile(self.path, self.code, 'utf8', function (err) {
          error = err
        })

        if (!error) {
          return true
        }
      } catch (e) {
        self.openDialog('error', e)
        return false
      }

      return false
    },
    setPath (path) {
      this.path = path
    },
    setEditor (value) {
      this.$refs.codemirror.editor.setValue(value)
      this.$refs.codemirror.editor.save()
    },
    clean () {
      this.setEditor('')
      this.setPath('')
      this.$refs.codemirror.editor.markClean()
      this.$refs.codemirror.editor.clearHistory()
    },
    dropFile (file, ext) {
      const self = this
      const remote = this.$electron.remote
      const dialog = remote.dialog
      const browserWindow = remote.BrowserWindow
      const focusedWindow = browserWindow.getFocusedWindow()

      if (file.type === 'text/plain' || file.type === 'application/text' || ext === 'txt' || ext === 'md') {
        self.readFile(file.path)
      } else {
        dialog.showMessageBox(focusedWindow, {
          title: 'error',
          type: 'error',
          buttons: ['OK'],
          detail: 'This file format is not supported.'
        })
      }
    },
    openLinkExternal () {
      const electron = this.$electron
      const window = electron.remote.getCurrentWindow()

      document.addEventListener('click', function (e) {
        let target = e.target
        let href = target.getAttribute('href')

        if (target.tagName !== 'A' && !href) {
          return
        }

        if (href.substring(0, 4) === 'http') {
          e.preventDefault()
          // get status
          let status = window.isAlwaysOnTop()
          // on top
          window.setAlwaysOnTop(true)
          // open link
          electron.shell.openExternal(target.href)
          // restore
          if (!status) {
            setTimeout(function () {
              window.setAlwaysOnTop(false)
            }, 1000)
          }
        }
      })
    }
  },
}
</script>
