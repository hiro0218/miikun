var remote = require('electron').remote;
var app = remote.app;
var Menu = remote.require('electron').Menu;
var dialog = remote.require('electron').dialog;
var browserWindow = remote.BrowserWindow;
var focusedWindow = browserWindow.getFocusedWindow();
var packageJson = require('./package.json');
var recentFile = require('./browser/recentFile');

const OSX = process.platform === 'darwin';
const WIN = process.platform === 'win32';
const isDevelop = /[\\/]electron-prebuilt[\\/]/.test(process.execPath);

/**
 * Menu bar
 */
global.menuTemplate = [];

// Mac
if (OSX) {
    global.menuTemplate.push({
        label: app.getName(),
        submenu: [{
            label: 'Exit',
            accelerator: 'CmdOrCtrl+Q',
            click: function (item, focusedWindow) {
                focusedWindow.close();
            }
        }]
    });
}

// 共通
global.menuTemplate.push({
    label: 'File',
    submenu: [
        {
            label: 'New',
            accelerator: 'CmdOrCtrl+N',
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    newFile();
                }
            }
        },
        {
            label: 'Open',
            accelerator: 'CmdOrCtrl+O',
            click: function(item, focusedWindow) {
                if (focusedWindow) {
                    dialogOpenFile();
                }
            },
        },
        {
            label: 'Save',
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    saveFile();
                }
            },
            accelerator: 'CmdOrCtrl+S',
        },
        {
            label: 'Save as ...',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    dialogSaveAs();
                }
            },
        },
        { type: "separator" },
        {
            label: 'Recent Files',
            role: 'recent',
            submenu: []
        },
    ]
},
{
    label: 'Edit',
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
},
{
    label: 'Window',
    submenu: [
        {
            label: 'Toggle Full Screen',
            accelerator: (function () {
                return OSX ? 'Ctrl+Command+F' : 'F11';
            })(),
            click: function (item, focusedWindow) {
                if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
        },
        { type: 'separator' },
        {
            label: 'Always on Top',
            accelerator: 'CmdOrCtrl+Shift+T',
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.setAlwaysOnTop(!focusedWindow.isAlwaysOnTop());
                }
            }
        },
    ]
},
{
    label: 'Help',
    submenu: [
        {
            label: 'Release Note',
            click: function () {
                require('shell').openExternal('https://github.com/hiro0218/editor/releases');
            }
        },
        { type: 'separator' },
        {
            label: 'About',
            click: function () {
                dialogAbout();
            }
        },
    ]
});

// set Recently File List
recentFile.initMenu();

// Windows
if (WIN) {
    global.menuTemplate[0].submenu.push({
        type: "separator"
    },{
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: function (item, focusedWindow) {
            focusedWindow.close();
        }
    });
}

// 開発時のみ
if (isDevelop) {
    global.menuTemplate.push({
        label: '☺',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                    focusedWindow.reload();
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: (function () {
                    return OSX ? 'Alt+Command+I' :'Ctrl+Shift+I';
                })(),
                click: function (item, focusedWindow) {
                    if (focusedWindow)
                    focusedWindow.toggleDevTools();
                }
            },
        ]
    });
}

var menu = Menu.buildFromTemplate(global.menuTemplate);
Menu.setApplicationMenu(menu);


/**
 * Menu
 **/
// Word Count
// var countWord = document.getElementsByClassName("countWord")[0];
// countWord.addEventListener("click", function() {
//     var text = window.editor.getValue().replace(/(\n|\t)/g, '');
//     var template = "<p><b>Characters (no spaces):</b> #1</p>" +
//                    "<p><b>Characters (with spaces):</b> #2</p>";
//         template = template.replace(/#1/g, text.length);
//         template = template.replace(/#2/g, text.replace(/ /g, '').length);
//
//     basicModal.show({
//         body: template,
//         buttons: {
//             action: {
//                 title: 'OK',
//                 fn: basicModal.close
//             }
//         }
//     });
// }, false);
