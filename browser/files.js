var fs = require('fs');
var remote = require('remote');
var packagejson = require('./package.json');
var app = remote.app;
var Dialog = remote.require('dialog');
var browserWindow = remote.require('browser-window');
var FocusedWindow = browserWindow.getFocusedWindow();

var OPEN_FILE_PATH = "";
var MODIFY = false;

// ドラッグオーバー
document.addEventListener('dragover', function(e) {
    e.preventDefault();
    return false;
}, true);

// ドロップ
document.addEventListener('drop', function(e) {
    e.preventDefault();

    // File API ファイルオブジェクトを取得
    var file = e.dataTransfer.files[0];

    // MIMEタイプをチェック
    if ( file.type === "text/plain" || file.type === "application/text" ||
         file.name.split(".")[1] === "txt" || file.name.split(".")[1] === "md"
    ) {
        // 編集中
        if (MODIFY) {
            chooseSave();
        }
        if (!MODIFY) {
            openFile(file.path);
        }
    } else {
        basicModalAlert("This file format is not supported.");
    }

    return false;
}, true);

function setWindowTitle(path) {
    if (path) {
        FocusedWindow.setTitle(path +" - " + packagejson.name);
    } else {
        FocusedWindow.setTitle(packagejson.name);
    }
}

function newFile() {
    // 新規ファイルで未編集
    if (!MODIFY && !OPEN_FILE_PATH) {
        return;
    }

    // 編集中
    if (MODIFY) {
        chooseSave();
    }

    // 編集中でない場合は初期化
    if (!MODIFY) {
        OPEN_FILE_PATH = "";
        setWindowTitle('');
        window.editor.getDoc().setValue("");
    }
}

function chooseSave() {
    var response = dialogCloseModifyFile();

    switch (response) {
        case 0: // Yes
            // 既存ファイルの保存
            if (OPEN_FILE_PATH) {
                save();
            } else {
                dialogSaveAs();
            }
            break;
        case 1: // No
            // 保存しない
            MODIFY = false;
            break;
        case 2: // Cancel
            // スルー
            break;
    }
}

function openFile(path) {
    if (OPEN_FILE_PATH === path) {
        basicModalAlert("This file is already open.");
    }
    fs.readFile(path, 'utf8', function(err, content) {
        if (err !== null) {
            basicModalAlert('error: ' + err);
        } else {
            setWindowTitle(path);
            window.editor.getDoc().setValue(content);
            MODIFY = false;
            OPEN_FILE_PATH = path;
        }
    });
}

function save(path, data) {
    // 未編集の場合はお帰り願う
    if (!MODIFY) {
        return;
    }
    fs.writeFile(path, data, function(err) {
        if (err !== null) {
            basicModalAlert('error: ' + err);
        } else {
            MODIFY = false;
            OPEN_FILE_PATH = path;  // for new file
            setWindowTitle(path);   // for new file
            snackSave();
        }
    });
}

function saveFile() {
    if (OPEN_FILE_PATH) {
        var data =  window.editor.getValue();
        save(OPEN_FILE_PATH, data);
    } else {
        dialogSaveAs();
    }
}

function saveAsFile(path) {
    var data = window.editor.getValue();
    save(path, data);
}

function basicModalAlert(str) {
    basicModal.show({
        body: "<p>"+ str +"</p>",
        buttons: {
            action: {
                title: 'OK',
                fn: basicModal.close
            }
        }
    });
}

function snackSave() {
    window.app.$broadcast('fileSaved', {
        message: 'Document saved.',
        timeout: 1000,
        // actionText: '',
        // actionHandler: function(e) {
        //     console.log(e);
        // },
    });
}
