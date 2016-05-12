"use strict";

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const dialog = electron.dialog;

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
        webPreferences: {
            textAreasAreResizable: false,
        }
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.setTitle(packagejson.name);

    // クラッシュ
    mainWindow.webContents.on('crashed', function(event) {
        console.log('webContents crashed: '+ event);
    });
    mainWindow.webContents.on('crashed', function() {
        console.log("webContents crashed");
        const options = {
            type: 'info',
            title: 'Renderer Process Crashed',
            message: 'This process has crashed.',
            buttons: ['Reload', 'Close']
        }
        dialog.showMessageBox(options, function(index) {
            if (index === 0) {
                mainWindow.reload();
            } else {
                mainWindow.close();
            }
        })
    });

    // 応答なし
    mainWindow.on('unresponsive', function() {
        console.log("unresponsive");
        const options = {
            type: 'info',
            title: 'Renderer Process Hanging',
            message: 'This process is hanging.',
            buttons: ['Reload', 'Close']
        };
        dialog.showMessageBox(options, function(index) {
            if (index === 0) {
                mainWindow.reload();
            } else {
                mainWindow.close();
            }
        });
    });


    // ウィンドウが閉じられたらアプリも終了
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

process.on('uncaughtException', function(err) {
    console.log("uncaughtException: "+ err);
});

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
    app.quit();
});
