var remote = require('electron').remote
var app = remote.app
var Menu = remote.require('electron').Menu
var dialog = remote.require('electron').dialog
var shell = remote.shell
var browserWindow = remote.BrowserWindow
var focusedWindow = browserWindow.getFocusedWindow()
var pkg = require('../../package.json')

const OSX = process.platform === 'darwin'
const WIN = process.platform === 'win32'
const isDevelop = /[\\/]electron-prebuilt[\\/]/.test(process.execPath)

module.exports = {
  menubar: [],
  newFile: function () {},
  openFile: function () {},
  saveFile: function () {},
  saveAsFile: function () {},
  dialogAbout: function () {
    dialog.showMessageBox(focusedWindow, {
      title: pkg.name + ' - About',
      type: 'question',
      icon: './app/image/about.png',
      message: pkg.name + ' Ver.' + pkg.version,
      detail: pkg.description + '\n\n' +
      'Electron: ' + process.versions.electron + '\n' +
      'Chromium: ' + process.versions.chrome + '\n' +
      'V8: ' + process.versions.v8 + '\n' +
      'Node.js: ' + process.versions.node,
      buttons: ['OK']
    })
  },
  ready: function () {
    var self = this

    self.addMenuOSX()

    self.menubar.push({
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: function (item) {
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
          click: function () {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
          }
        },
        { type: 'separator' },
        {
          label: 'Always on Top',
          accelerator: 'CmdOrCtrl+Shift+T',
          type: 'checkbox',
          checked: false,
          click: function () {
            focusedWindow.setAlwaysOnTop(!focusedWindow.isAlwaysOnTop())
          }
        }
      ]
    }, {
      label: 'Help',
      submenu: [
        {
          label: 'Release Note',
          click: function () {
            shell.openExternal('https://github.com/hiro0218/Miikun/releases')
          }
        },
        { type: 'separator' },
        {
          label: 'About',
          click: function () {
            self.dialogAbout()
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
        label: app.getName(),
        submenu: [{
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: function () {
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
        click: function () {
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
            click: function () {
              focusedWindow.reload()
            }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: (function () {
              return OSX ? 'Alt+Command+I' : 'Ctrl+Shift+I'
            })(),
            click: function () {
              focusedWindow.toggleDevTools()
            }
          }
        ]
      })
    }
  }
}
