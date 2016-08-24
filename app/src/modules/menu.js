const remote = require('electron').remote
const Menu = remote.require('electron').Menu
const dialog = remote.require('electron').dialog
const shell = remote.shell
const nativeImage = remote.require('electron').nativeImage
const iconImage = nativeImage.createFromPath('./app/static/icon.png')

const pkg = require('../../package.json')
const OSX = process.platform === 'darwin'
const WIN = process.platform === 'win32'
const isDevelop = /[\\/]electron-prebuilt[\\/]/.test(process.execPath)

module.exports = {
  menubar: [],
  newFile: function () {},
  openFile: function () {},
  saveFile: function () {},
  saveAsFile: function () {},
  ready: function () {
    var self = this

    self.addMenuOSX()

    self.menubar.push({
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: function () {
            self.newFile()
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: function () {
            self.openFile()
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: function () {
            self.saveFile()
          }
        },
        {
          label: 'Save as',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: function () {
            self.saveAsFile()
          }
        }
      ]
    }, {
      label: 'Window',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: (function () {
            return OSX ? 'Ctrl+Command+F' : 'F11'
          })(),
          click: function (item, focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
          }
        },
        { type: 'separator' },
        {
          label: 'Always on Top',
          accelerator: 'CmdOrCtrl+Shift+T',
          type: 'checkbox',
          checked: false,
          click: function (item, focusedWindow) {
            focusedWindow.setAlwaysOnTop(!focusedWindow.isAlwaysOnTop())
          }
        }
      ]
    }, {
      label: 'Help',
      submenu: [
        {
          label: 'Website',
          click: function () {
            shell.openExternal('https://github.com/hiro0218/miikun/')
          }
        },
        {
          label: 'Release Note',
          click: function () {
            shell.openExternal('https://github.com/hiro0218/Miikun/releases')
          }
        },
        { type: 'separator' },
        {
          label: 'About',
          click: function (item, focusedWindow) {
            dialog.showMessageBox(focusedWindow, {
              title: 'About',
              type: 'none',
              icon: iconImage,
              message: pkg.name + ' Ver.' + pkg.version,
              detail: pkg.description + '\n\n' +
              'Electron: ' + process.versions.electron + '\n' +
              'Chromium: ' + process.versions.chrome + '\n' +
              'V8: ' + process.versions.v8 + '\n' +
              'Node.js: ' + process.versions.node,
              buttons: []
            })
          }
        }
      ]
    })

    self.addMenuWin()

    self.addMenuDev()

    Menu.setApplicationMenu(
      Menu.buildFromTemplate(self.menubar)
    )
  },
  addMenuOSX: function () {
    if (OSX) {
      var self = this
      self.menubar.push({
        label: pkg.name,
        submenu: [{
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: function (item, focusedWindow) {
            focusedWindow.close()
          }
        }]
      })
    }
  },
  addMenuWin: function () {
    if (WIN) {
      var self = this
      self.menubar[0].submenu.push({
        type: 'separator'
      }, {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: function (item, focusedWindow) {
          focusedWindow.close()
        }
      })
    }
  },
  addMenuDev: function () {
    if (isDevelop) {
      var self = this

      self.menubar.push({
        label: '👻',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: function (item, focusedWindow) {
              focusedWindow.reload()
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: (function () {
              return OSX ? 'Alt+Command+I' : 'Ctrl+Shift+I'
            })(),
            click: function (item, focusedWindow) {
              focusedWindow.toggleDevTools()
            }
          }
        ]
      })
    }
  }
}
