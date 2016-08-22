'use strict'

const electron = require('electron')
const path = require('path')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog

let mainWindow
let config = {}

if (process.env.NODE_ENV === 'development') {
  config = require('../config')
  config.url = `http://localhost:${config.port}`
} else {
  config.devtron = false
  config.url = `file://${__dirname}/dist/index.html`
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    resizable: true,
    webPreferences: {
      textAreasAreResizable: false
    }
  })

  mainWindow.loadURL(config.url)

  if (process.env.NODE_ENV === 'development') {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/devtron'))

    let installExtension = require('electron-devtools-installer')

    installExtension.default(installExtension.VUEJS_DEVTOOLS)
      .then((name) => mainWindow.webContents.openDevTools())
      .catch((err) => console.log('An error occurred: ', err))
  }

  mainWindow.on('closed', function() {
    mainWindow = null
  })

  mainWindow.webContents.on('crashed', function () {
    console.log('webContents crashed')
    dialog.showMessageBox({
      type: 'info',
      title: 'Renderer Process Crashed',
      message: 'This process has crashed.',
      buttons: ['Reload', 'Close']
    }, function (index) {
      if (index === 0) {
        mainWindow.reload()
      } else {
        mainWindow.close()
      }
    })
  })

  mainWindow.on('unresponsive', function () {
    console.log('unresponsive')
    dialog.showMessageBox({
      type: 'info',
      title: 'Renderer Process Hanging',
      message: 'This process is hanging.',
      buttons: ['Reload', 'Close']
    }, function (index) {
      if (index === 0) {
        mainWindow.reload()
      } else {
        mainWindow.close()
      }
    })
  })

  mainWindow.webContents.on('crashed', function (event) {
    console.log('webContents crashed: ' + event)
  })

  console.log('mainWindow opened')
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

process.on('uncaughtException', function (err) {
  console.log('uncaughtException: ' + err)
})
