var remote = require('remote');
var fs = require('fs');
var app = remote.app;
var Dialog = remote.require('dialog');
var browserWindow = remote.require('browser-window');
var FocusedWindow = browserWindow.getFocusedWindow();
var packagejson = null;

function dialogAbout() {
    var json = getPackageJson();

    Dialog.showMessageBox(FocusedWindow, {
        title: 'About',
        type: 'none',
        buttons: ['OK'],
        detail: json.name + "\n" + json.version + "\n" + json.description
    },
    function (respnse) {
        // if (respnse === 0) {}
    });
}


function getPackageJson() {
    if (packagejson === null) {
        var strJson = fs.readFileSync('package.json', 'utf-8');
        packagejson = JSON.parse(strJson);
    }
    return packagejson;
}
