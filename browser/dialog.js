const remote = require('remote');
const fs = require('fs');
const app = remote.app;
const Dialog = remote.require('dialog');
const browserWindow = remote.require('browser-window');
const focusedWindow = browserWindow.getFocusedWindow();
const packagejson = require('./package.json');

function dialogOpenFile() {
    Dialog.showOpenDialog(focusedWindow, {
        title: 'Open Dialog',
        filters: [
            {name: 'Documents', extensions: ['txt', 'md']},
        ],
        properties: ['openFile']
    }, function (item) {
        if (item) {
            openFile(item[0]);
        }
    });
}

function dialogSaveAs() {
    Dialog.showSaveDialog(focusedWindow, {
        title: 'Save Dialog',
        filters: [
            {name: 'Markdown file', extensions: ['md']},
            {name: 'Text file', extensions: ['txt']},
        ],
    }, function (item) {
        if (item) {
            saveAsFile(item);
        }
    });
}

function dialogAbout() {
    Dialog.showMessageBox(focusedWindow, {
        title: 'About',
        type: 'none',
        buttons: ['OK'],
        detail: packagejson.name + "\n" + packagejson.version + "\n" + packagejson.description
    });
}

function dialogCloseModifyFile() {
    var response = 0;

    // 同期
    response = Dialog.showMessageBox(focusedWindow, {
        title: packagejson.name,
        type: 'warning',
        buttons: ['Yes', 'No', 'Cancel'],
        detail: "Wolud you like to save changes?",
    });

    return response;
}
