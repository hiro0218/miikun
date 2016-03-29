"use strict";

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const Menu = electron.Menu;
const Tray = electron.Tray;
const Platform = process.platform;

let mainWindow = null;

// Electronの初期化完了後に実行
app.on('ready', function () {
    readyMainWindow(process.cwd());
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

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
    if (Platform != 'darwin') {
        app.quit();
    }
});
