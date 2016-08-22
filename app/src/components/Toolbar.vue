<style scoped>
</style>

<template>
  <div class="toolbar-container">
    <ui-toolbar title="" flat hide-nav-icon preloader-top>
      <div class="ui-toolbar-left">
        <ui-icon-button type="clear" color="black" icon="menu" v-el:toolbar-menu></ui-icon-button>
        <ui-icon-button type="clear" color="black" icon="undo" tooltip="Undo" v-el:btn-undo v-on:click="undo()" v-bind:disabled="!canUndo"></ui-icon-button>
        <ui-icon-button type="clear" color="black" icon="redo" tooltip="Redo" v-on:click="redo()" v-bind:disabled="!canRedo"></ui-icon-button>
      </div>
      <div slot="actions">
        <ui-icon-button type="clear" color="black" icon="save" tooltip="Save" v-on:click="save()" v-bind:disabled="!canSave"></ui-icon-button>
        <div class="ui-icon-button" v-el:btn-switch><ui-switch name="toggle_preview" :value.sync="switchPreview" hide-label></ui-switch></div>
      </div>
    </ui-toolbar>
  </div>
  <ui-menu :trigger="$els.toolbarMenu" :options="menuOptions" @option-selected="menuOptionSelected" show-secondary-text></ui-menu>
  <ui-tooltip :trigger='$els.btnSwitch' content='Preview'></ui-tooltip>
</template>

<script>
var fs = require('fs')
var remote = require('electron').remote
var browserWindow = remote.BrowserWindow
var focusedWindow = browserWindow.getFocusedWindow()

export default {
  name: 'mii-toolbar',
  data () {
    return {
      menuOptions: [
        {
          id: 'new',
          text: 'New',
          icon: 'insert_drive_file',
          secondaryText: 'Ctrl+N'
        }, {
          id: 'open',
          text: 'Open',
          icon: 'folder',
          secondaryText: 'Ctrl+O'
        }, {
          id: 'save',
          text: 'Save',
          icon: 'save',
          secondaryText: 'Ctrl+S'
        }, {
          id: 'saveAs',
          text: 'Save As',
          icon: 'save',
          secondaryText: 'Ctrl+Shift+S'
        }, {
          type: 'divider'
        }, {
          id: 'setting',
          text: 'Setting',
          icon: 'settings',
          disabled: true
        }
      ],
      canUndo: false,
      canRedo: false,
      canSave: false,
      switchPreview: false
    }
  },
  ready () {
  },
  watch: {
    switchPreview: function (val, oldVal) {
      this.$root.$children[0].$refs.miiEditor.isPreview = val
    }
  },
  methods: {
    menuOptionSelected (option) {
      switch (option.id) {
        case 'new':
          this.newFile()
          break
        case 'open':
          this.openFile()
          break
        case 'save':
          this.save()
          break
        case 'saveAs':
          this.saveAs()
          break
        case 'setting':
          break
        default:
          break
      }
    },
    newFile () {
      var miiEditor = this.$root.$children[0].$refs.miiEditor
      // new + not modify
      if (!miiEditor.path && miiEditor.isClean()) {
        return
      }
      // saved + not modify
      if (miiEditor.isClean()) {
        miiEditor.clean()
        return
      }

      var response = this.modifyDialog()
      switch (response) {
        case 0:  // Yes
          this.save()
          break
        case 1:  // No
          miiEditor.clean()
          break
      }
    },
    openFile () {
      var self = this
      var dialog = this.$electron.remote.dialog
      dialog.showOpenDialog(focusedWindow, {
        title: 'Open Dialog',
        filters: [{
          name: 'Documents', extensions: ['txt', 'md']
        }],
        properties: ['openFile']
      }, function (item) {
        if (item) {
          self.readFile(item[0])
        }
      })
    },
    readFile (path) {
      var self = this
      var miiEditor = self.$root.$children[0].$refs.miiEditor
      fs.readFile(path, 'utf8', function (err, content) {
        if (err === null) {
          miiEditor.setPath(path)
          miiEditor.setEditor(content)
          miiEditor.editor.markClean()
          miiEditor.editor.clearHistory()
          miiEditor.updateButtonStatus()
        } else {
          self.openDialog('error', err.toString())
        }
      })
    },
    openDialog (type, msg) {
      var dialog = this.$electron.remote.dialog
      dialog.showMessageBox(focusedWindow, {
        title: type,
        type: type,
        buttons: ['OK'],
        detail: msg
      })
    },
    saveAsDialog () {
      var dialog = this.$electron.remote.dialog
      var savePath = dialog.showSaveDialog(focusedWindow, {
        title: 'Save Dialog',
        filters: [
          {name: 'Markdown file', extensions: ['md']},
          {name: 'Text file', extensions: ['txt']}
        ]
      })
      return savePath
    },
    modifyDialog () {
      var dialog = this.$electron.remote.dialog
      var response = dialog.showMessageBox(focusedWindow, {
        title: '',
        type: 'warning',
        buttons: ['Yes', 'No', 'Cancel'],
        detail: 'Wolud you like to save changes?'
      })
      return response
    },
    writeFile () {
      var self = this
      var miiEditor = self.$root.$children[0].$refs.miiEditor
      try {
        var error = fs.writeFileSync(miiEditor.path, miiEditor.input, 'utf8')
        if (!error) {
          return true
        }
      } catch (e) {
        self.openDialog('error', e)
        return false
      }
    },
    undo () {
      this.$root.$children[0].$refs.miiEditor.undo()
    },
    redo () {
      this.$root.$children[0].$refs.miiEditor.redo()
    },
    save () {
      var miiEditor = this.$root.$children[0].$refs.miiEditor
      var path = miiEditor.path
      var result
      if (path) {
        miiEditor.setPath(path)
        result = this.writeFile()
      } else {
        var savePath = this.saveAsDialog()
        if (savePath) {
          miiEditor.setPath(savePath)
          result = this.writeFile()
        }
      }
      if (result) {
        miiEditor.editor.markClean()
        miiEditor.editor.clearHistory()
        miiEditor.updateButtonStatus()
      }
    },
    saveAs () {
      var miiEditor = this.$root.$children[0].$refs.miiEditor
      var result
      var savePath = this.saveAsDialog()
      if (savePath) {
        miiEditor.setPath(savePath)
        result = this.writeFile()
        if (result) {
          miiEditor.editor.markClean()
          miiEditor.editor.clearHistory()
          miiEditor.updateButtonStatus()
        }
      }
    }
  }
}
</script>
