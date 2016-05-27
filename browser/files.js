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
        if (window.app.$data.file.modify) {
            chooseSave();
        }
        if (!window.app.$data.file.modify) {
            openFile(file.path);
        }
    } else {
        openDialog("error", "This file format is not supported.");
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
    if (!window.app.$data.file.modify && !window.app.$data.file.path) {
        return;
    }

    // 編集中
    if (window.app.$data.file.modify) {
        chooseSave();
    }

    // 編集中でない場合は初期化
    if (!window.app.$data.file.modify) {
        window.app.$data.file.path = "";
        setWindowTitle("");
        setEditor("");
    }
}

function chooseSave() {
    var response = dialogCloseModifyFile();

    switch (response) {
        case 0: // Yes
            // 既存ファイルの保存
            if (window.app.$data.file.path) {
                saveFile();
            } else {
                dialogSaveAs();
            }
            break;
        case 1: // No
            // 保存しない
            window.app.$data.file.modify = false;
            break;
        case 2: // Cancel
            // スルー
            break;
    }

    return response;
}

function openFile(path) {
    if (window.app.$data.file.path === path) {  // 既に開いている
        openDialog("error", "This file is already open.");

    } else if (window.app.$data.file.modify) {  // 編集中
        // ファイル保存確認
        var resp = chooseSave();

        // ファイルを読み込む
        if (resp !== 3) {  // ファイルを読み込む流れ
            window.app.$data.file.modify = false;
            openFile(path);
        }

    } else {
        fs.readFile(path, 'utf8', function(err, content) {
            if (err === null) {
                loadSuccess(path, content);
            } else {
                openDialog("error", err.toString());
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
    window.app.$data.file.modify = false;
    window.app.$data.file.path = path;

    // 通知
    window.app.openSnackbar('Document loaded.');
}

function save(path, data) {
    // 未編集の場合はお帰り願う
    if (!window.app.$data.file.modify) {
        return;
    }

    try {
        var error = fs.writeFileSync(path, data, 'utf8');

        if (error === undefined) {
            window.app.$data.file.modify = false;
            window.app.$data.file.path = path;  // for new file
            setWindowTitle(path);   // for new file
            window.app.openSnackbar('Document saved.');
        }

    } catch (e) {
        openDialog("error", e);
    }
}

function saveFile() {
    if (window.app.$data.file.path) {
        save(window.app.$data.file.path, window.editor.getValue());
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
    window.editor.setCursor(0);
}
