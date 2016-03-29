var fs = require('fs');

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
        openFile(file.path);
    } else {
        alert("No Support");
    }

    return false;
}, true);

function openFile(path) {
    fs.readFile(path, 'utf8', function(err, content) {
        window.editor.value = content;
        window.cm.getDoc().setValue(content);
    });
}

function saveAsFile(path) {
    var data =  window.cm.getValue();
    fs.writeFile(path, data, function(error) {
        if (error !== null) {
            alert('error: ' + error);
        }
    });
}
