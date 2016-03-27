"use strict";

const electron = require('electron');

// アプリケーションをコントロールするモジュール
const app = electron.app;
// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

const Menu = electron.Menu;
const Tray = electron.Tray;
const Platform = process.platform;

let mainWindow = null;

// Electronの初期化完了後に実行
app.on('ready', function () {
    readyMainWindow(process.cwd());

    readyApplicationMenu();
});

function readyMainWindow(baseDir) {
    // メイン画面の表示。ウィンドウの幅、高さを指定できる
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        'min-width': 400,
        'min-height': 300,
        resizable: true,
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // mainWindow.setAutoHideMenuBar(true);

    // ウィンドウが閉じられたらアプリも終了
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// メニュー情報の作成
function readyApplicationMenu() {
        var menu = Menu.buildFromTemplate([{
            label: 'File',
            submenu: [/*{
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click: function () {
                // 「ファイルを開く」ダイアログの呼び出し
                require('dialog').showOpenDialog({
                properties: ['openDirectory']
            }, function (baseDir) {
            if (baseDir && baseDir[0]) {
            openWindow(baseDir[0]);
        }
    });
    }
    }, {
    type: 'separator'
    }, */
    {
        label: 'Save As LocalStorage',
        accelerator: 'CmdOrCtrl+S',
        click: function(item, focusedWindow) {
            if (focusedWindow) {
                focusedWindow.webContents.executeJavaScript('save()');
            }
        }
    },
    {
        label: 'Clear As LocalStorage',
        accelerator: 'CmdOrCtrl+Delete',
        click: function(item, focusedWindow) {
            if (focusedWindow) {
                focusedWindow.webContents.executeJavaScript('clear()');
            }
        }
    },
    { type: 'separator'},
    {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: function () {
            app.quit();
        }
    }]
    }, {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            },
        ]
    }, {
        label: 'View',
        submenu: [{
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: function(item, focusedWindow) {
                if (focusedWindow)
                focusedWindow.reload();
            }
        },
        {
            label: 'Toggle Full Screen',
            accelerator: (function() {
                return (Platform == 'darwin') ? 'Ctrl+Command+F' : 'F11';
            })(),
            click: function(item, focusedWindow) {
                if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
        }, {
            label: 'Toggle Developer Tools',
            accelerator: (function() {
                return (Platform == 'darwin') ? 'Alt+Command+I' : 'Ctrl+Shift+I';
            })(),
            click: function(item, focusedWindow) {
                if (focusedWindow)
                focusedWindow.toggleDevTools();
            }
        }]
    }, {
        label: 'Help',
        role: 'help',
        submenu: [{
            label: 'Learn More',
            click: function(item, focusedWindow) {
                if (focusedWindow) {
                    // electron.shell.openExternal('https://github.com/hiro0218/editor');
                }
            }
        },
        { type: 'separator'},
        {
            label: 'About',
            click: function() {
                electron.shell.openExternal('https://github.com/hiro0218/editor');
            }
        }]
    }]);

    Menu.setApplicationMenu(menu);
}


// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
    if (Platform != 'darwin') {
        app.quit();
    }
});
