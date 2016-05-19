var fs = require('fs');
var remote = require('electron').remote;
var browserWindow = remote.BrowserWindow;
var FocusedWindow = browserWindow.getFocusedWindow();
var packagejson = require('./package.json');
var recentFile = require('./browser/recentFile');

// ドロップ
window.addEventListener('drop', function(e) {
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
        setWindowTitle("");
        setEditor("");
    }
}

function chooseSave() {
    var response = dialogCloseModifyFile();

    switch (response) {
        case 0: // Yes
            // 既存ファイルの保存
            if (OPEN_FILE_PATH) {
                saveFile();
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

    return response;
}

function openFile(path) {
    if (basicModal.visible()) {
        return;
    }

    if (OPEN_FILE_PATH === path) {
        basicModalAlert("This file is already open.");
    } else {
        fs.readFile(path, 'utf8', function(err, content) {
            if (err !== null) {
                basicModalAlert('error: ' + err);
            } else {
                loadSuccess(path, content);
            }
        });
    }
}

function loadSuccess(path, content) {
    // タイトルに反映
    setWindowTitle(path);
    // メニューに追加
    recentFile.set(path);

    // エディタへ反映
    setEditor(content);

    // フラグ
    MODIFY = false;
    OPEN_FILE_PATH = path;

    // 通知
    snack('Document loaded.');
}

function save(path, data) {
    // 未編集の場合はお帰り願う
    if (!MODIFY) {
        return;
    }

    try {
        var error = fs.writeFileSync(path, data, 'utf8');

        if (error === undefined) {
            MODIFY = false;
            OPEN_FILE_PATH = path;  // for new file
            setWindowTitle(path);   // for new file
            snack('Document saved.');
        }
        
    } catch (e) {
        basicModalAlert('error: ' + e);
    }
}

function saveFile() {
    if (OPEN_FILE_PATH) {
        save(OPEN_FILE_PATH, window.editor.getValue());
    } else {
        dialogSaveAs();
    }
}

function saveAsFile(path) {
    save(path, window.editor.getValue());
}

function setEditor(content) {
    var doc = window.editor.getDoc();
    doc.setValue(content);
    doc.clearHistory();
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

function snack(msg) {
    window.app.$broadcast('fileOperation', {
        message: msg,
        timeout: 1000,
    });
}
