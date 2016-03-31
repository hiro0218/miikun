var fs = require('fs');

var OPEN_FILE_PATH = "";
var MODIFY = false;

// ドラッグオーバー
document.addEventListener('dragover',function(e){
    e.preventDefault();
    return false;
}, true);

// ドロップ
document.addEventListener('drop',function(e){
    e.preventDefault();

    // File API ファイルオブジェクトを取得
    var file = e.dataTransfer.files[0];

    // MIMEタイプをチェック
    if ( file.type === "text/plain" || file.type === "application/text" ) {
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
        window.editor.value = "";
        window.cm.getDoc().setValue("");
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
                saveAsFile();
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
            MODIFY = false;
            OPEN_FILE_PATH = path;
            window.editor.value = content;
            window.cm.getDoc().setValue(content);
        }
    });
}

function save(path, data) {
    fs.writeFile(path, data, function(err) {
        if (err !== null) {
            basicModalAlert('error: ' + err);
        } else {
            MODIFY = false;
            OPEN_FILE_PATH = path;  // for new file
        }
    });
}

function saveFile() {
    if (OPEN_FILE_PATH) {
        var data =  window.cm.getValue();
        save(OPEN_FILE_PATH, data);
    } else {
        dialogSaveAs();
    }
}

function saveAsFile(path) {
    var data = window.cm.getValue();
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
