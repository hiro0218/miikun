'use strict'

module.exports = {
  dropZone: null,
  dropFile: function (file, ext) {},
  ready: function () {
    var self = this
    let dropZone = document.getElementsByClassName('dropzone')[0]
    if (dropZone === null) {
      return
    }

    self.dropOverlay(dropZone)

    window.addEventListener('drop', function (e) {
      e.preventDefault()
      let file = e.dataTransfer.files[0]
      console.log(file)
      let ext = file.name.split('.')[1]
      self.dropFile(file, ext)
    }, true)
  },
  dropOverlay: function (dropZone) {
    window.addEventListener('dragenter', function (e) {
      dropZone.style.opacity = 1
      dropZone.style.zIndex = 100
    })

    dropZone.addEventListener('dragleave', function (e) {
      this.style.opacity = null
      this.style.zIndex = null
    })

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault()
      this.style.opacity = null
      this.style.zIndex = null
    })

    document.addEventListener('dragstart', function (e) {
      e.preventDefault()
    })

    window.addEventListener('dragover', function (e) {
      e.preventDefault()
    })
  }
}
