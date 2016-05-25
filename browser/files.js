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
        if (FILE.MODIFY) {
            chooseSave();
        }
        if (!FILE.MODIFY) {
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
    if (!FILE.MODIFY && !FILE.PATH) {
        return;
    }

    // 編集中
    if (FILE.MODIFY) {
        chooseSave();
    }

    // 編集中でない場合は初期化
    if (!FILE.MODIFY) {
        FILE.PATH = "";
        setWindowTitle("");
        setEditor("");
    }
}

function chooseSave() {
    var response = dialogCloseModifyFile();

    switch (response) {
        case 0: // Yes
            // 既存ファイルの保存
            if (FILE.PATH) {
                saveFile();
            } else {
                dialogSaveAs();
            }
            break;
        case 1: // No
            // 保存しない
            FILE.MODIFY = false;
            break;
        case 2: // Cancel
            // スルー
            break;
    }

    return response;
}

function openFile(path) {
    if (FILE.PATH === path) {  // 既に開いている
        openDialog("error", "This file is already open.");

    } else if (FILE.MODIFY) {  // 編集中
        // ファイル保存確認
        var resp = chooseSave();

        // ファイルを読み込む
        if (resp !== 3) {  // ファイルを読み込む流れ
            FILE.MODIFY = false;
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
    FILE.MODIFY = false;
    FILE.PATH = path;

    // 通知
    window.app.openSnackbar('Document loaded.');
}

function save(path, data) {
    // 未編集の場合はお帰り願う
    if (!FILE.MODIFY) {
        return;
    }

    try {
        var error = fs.writeFileSync(path, data, 'utf8');

        if (error === undefined) {
            FILE.MODIFY = false;
            FILE.PATH = path;  // for new file
            setWindowTitle(path);   // for new file
            window.app.openSnackbar('Document saved.');
        }

    } catch (e) {
        openDialog("error", e);
    }
}

function saveFile() {
    if (FILE.PATH) {
        save(FILE.PATH, window.editor.getValue());
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
