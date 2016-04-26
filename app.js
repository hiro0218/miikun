"use strict";

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const Menu = electron.Menu;
const Tray = electron.Tray;
const Platform = process.platform;

let mainWindow = null;
var packagejson = require('./package.json');

// Electronの初期化完了後に実行
app.on('ready', function () {
    readyMainWindow(process.cwd());
});

// 二重起動防止
var shouldQuit = app.makeSingleInstance(function(argv, workingDirectory) {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.focus();
    }
    return true;
});
if (shouldQuit) {
    app.quit();
}

function readyMainWindow(baseDir) {
    // メイン画面の表示。ウィンドウの幅、高さを指定できる
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        resizable: true,
        "web-preferences": {
            "direct-write": false,
            'subpixel-font-scaling': false,
            textAreasAreResizable: false,
        }
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.setTitle(packagejson.name);

    // mainWindow.setAutoHideMenuBar(true);

    // ウィンドウが閉じられたらアプリも終了
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
    if (Platform != 'darwin') {
        app.quit();
    }
});
