const shell = require('electron').shell;

// リンク
document.addEventListener('click', function (e) {
    if (e.target.tagName.toLowerCase() === 'a') {
        if (e.target.getAttribute('href').substring(0, 4) == "http") {
            e.preventDefault();
            shell.openExternal(e.target.href);
        }
    }
});

// ドラッグ&ドロップ
var dropZone = document.getElementsByClassName('dropzone')[0];

window.addEventListener('dragover', function(e) {
    e.preventDefault();
});

document.addEventListener('dragstart', function(e) {
    e.preventDefault();
});

window.addEventListener('dragenter', function(e) {
    dropZone.style.opacity = 1;
    dropZone.style.zIndex = 100;
});

dropZone.addEventListener('dragleave', function(e) {
    dropZone.style.opacity = null;
    dropZone.style.zIndex = null;
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropZone.style.opacity = null;
    dropZone.style.zIndex = null;
});
