var remote = require('electron').remote
var dialog = remote.require('electron').dialog
var browserWindow = remote.BrowserWindow
var focusedWindow = browserWindow.getFocusedWindow()

module.exports = {
  dropZone: null,
  openFile: function (path) {},
  init: function () {
    var self = this

    self.dropZone = document.getElementsByClassName('dropzone')[0]
    if (self.dropZone === null) {
      return
    }

    self.dropOverlay()

    window.addEventListener('drop', function (e) {
      e.preventDefault()
      var file = e.dataTransfer.files[0]

      if (file.type === 'text/plain' || file.type === 'application/text' || file.name.split('.')[1] === 'txt' || file.name.split('.')[1] === 'md') {
        self.openFile(file.path)
      } else {
        dialog.showMessageBox(focusedWindow, {
          title: 'error',
          type: 'error',
          buttons: ['OK'],
          detail: 'This file format is not supported.'
        })
      }

    // return false
    }, true)
  },
  isAllowExt: function (name, type) {
    return (type === 'text/plain' || type === 'application/text' || name.split('.')[1] === 'txt' || name.split('.')[1] === 'md')
  },
  dropOverlay: function () {
    var self = this

    window.addEventListener('dragenter', function (e) {
      self.dropZone.style.opacity = 1
      self.dropZone.style.zIndex = 100
    })

    self.dropZone.addEventListener('dragleave', function (e) {
      self.dropZone.style.opacity = null
      self.dropZone.style.zIndex = null
    })

    self.dropZone.addEventListener('drop', function (e) {
      e.preventDefault()
      self.dropZone.style.opacity = null
      self.dropZone.style.zIndex = null
    })

    document.addEventListener('dragstart', function (e) {
      e.preventDefault()
    })

    window.addEventListener('dragover', function (e) {
      e.preventDefault()
    })
  }
}
