window.onload = function() {
    "use strict";

    // 宣言
    var editor = document.getElementById("editor");
    var result = document.getElementById("result");
    var modal  = document.getElementById('modal');
    var output  = document.getElementById('export');
    var charaCount = document.getElementById('chara-count');
    var btnSave   = document.getElementsByClassName('btn-save')[0];
    var btnClear  = document.getElementsByClassName('btn-clear')[0];
    var btnExport = document.getElementsByClassName('btn-export')[0];
    var btnToggle = document.getElementsByClassName('btn-toggle')[0];
    var timer = null;
    var prev_val = editor.value;

    // Behave.js
    window.editor = new Behave({
        textarea: editor,
        replaceTab: true,
        softTabs: true,
        tabSize: 4,
        autoOpen: true,
        overwrite: true,
        autoStrip: true,
        autoIndent: true,
        fence: false
    });

    // ストレージから読み込む
    loadStorage(editor);

    // ストレージに保存する
    window.setInterval(function(){
        saveStorage(editor);
    }, 60000);

    marked.setOptions({
        langPrefix: 'language-',
        breaks: true
    });

    // テキスト入力を反映させる
    keyup(editor, result, charaCount);

    // 初回実行
    if (editor.value) {
        keyup(editor, result, charaCount);
    }

    // フォーカス
    editor.addEventListener("focus", function(){
        window.clearInterval(timer);

        timer = window.setInterval(function(){
            var new_val = editor.value;
            // 変更があった場合
            if( prev_val != editor.value ){
                keyup(editor, result, charaCount);
            }
            prev_val = new_val;
        }, 1000);

    }, false);

    // アウトフォーカス
    editor.addEventListener("blur", function(){
        //window.clearInterval(timer);
        keyup(editor, result, charaCount);
    }, false);

    // ページ移動の確認
    // window.onbeforeunload = function(event){
    //     event = event || window.event;
    //     event.returnValue = 'Confirmation';
    // };

    // tool
    btnSave.addEventListener("click", function(){
        if (confirm("Save?")) {
            saveStorage(editor);
            keyup(editor, result, charaCount);
        }
    }, false);

    btnClear.addEventListener("click", function(){
        if (confirm("Clear?")) {
            editor.value = "";
            clearStorage();
            keyup(editor, result, charaCount);
        }
    }, false);

    btnExport.addEventListener("click", function(){
        // export html
        output.value = getMarkedValue(editor.value);

        // show modal
        modal.style.display = "block";
    }, false);

    output.addEventListener("focus", function(){
        output.select();
    }, false);

    btnToggle.addEventListener("click", function(e){
        togglePreview(e.target);
    }, false);

    // Modal
    window.addEventListener("click", function(e){
        if (e.target == modal) {
            // hide modal
            modal.style.display = "none";
        }
    }, false);

};

// other function
function getMarkedValue(value) {
    // エスケープされていない<script>タグを消去
    value = stripScriptTag(value);

    return marked(value);
}

function keyup(from, to, count) {
    // HTML変換
    var mkval = getMarkedValue(from.value);

    // 文字数カウント
    countResultText(mkval, count);

    // 反映
    to.innerHTML = mkval;

    // Prism.js(Highlight) re-render
    Prism.highlightAll();
}

function stripScriptTag(text) {
    var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    while(SCRIPT_REGEX.test(text)) {
        text = text.replace(SCRIPT_REGEX, "");
    }
    return text;
}

function countResultText(val, target) {
    target.innerHTML = val.length;
}

function togglePreview(target) {
    var preview = document.getElementsByClassName('preview-side')[0];
    var editor  = document.getElementsByClassName('editor-side')[0];

    if ( preview.style.display == "none" ) {
        preview.style.display = "";
        editor.style.width = "";
        target.value = ">>";
    } else {
        preview.style.display = "none";
        editor.style.width = "100%";
        target.value = "<<";
    }
}

// function enableInsertTAB(element) {
//     element.onkeydown = function(e) {
//         if (e.keyCode === 9) {
//             var val = this.value;
//             var start = this.selectionStart;
//             var end = this.selectionEnd;
//
//             this.value = val.substring(0, start) + '\t' + val.substring(end);
//
//             this.selectionStart = this.selectionEnd = start + 1;
//
//             return false;
//         }
//     };
// }

function saveStorage(element) {
    localStorage.setItem('markunVal', element.value);
}

function loadStorage(element) {
    element.innerHTML = localStorage.getItem('markunVal');
}

function clearStorage() {
    localStorage.removeItem('markunVal');
}
