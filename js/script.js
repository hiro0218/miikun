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

    // ストレージから読み込む
    loadStorage(editor);

    // ストレージに保存する
    window.setInterval(function(){
        saveStorage(editor);
    }, 60000);

    // CodeMirror
    var cm = window.CodeMirror.fromTextArea(editor, {
        mode: {
            name: 'markdown',
            highlightFormatting: true
        },
        theme: 'markdown',
        autofocus: true,
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 2,
        electricChars: true,
        styleActiveLine: true,
        matchBrackets: true,
        lineWrapping: true,
        extraKeys: {
            "Enter": "newlineAndIndentContinueMarkdownList"
        }
    });
    cm.on('change', function(e){
        // Trigger
        var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
        editor.dispatchEvent(event);

        editor.value = cm.getValue();
    });

    editor.addEventListener("change", function(){
        console.log("change");
        keyup(editor, result, charaCount);
    }, false);


    window.marked.setOptions({
        langPrefix: 'language-',
        breaks: true
    });

    // テキスト入力を反映させる
    //keyup(editor, result, charaCount);

    // 初回実行
    if (editor.value) {
        keyup(editor, result, charaCount);
    }

    // ページ移動の確認
    // window.onbeforeunload = function(event){
    //     event = event || window.event;
    //     event.returnValue = 'Confirmation';
    // };

    // tool
    btnSave.addEventListener("click", function(){
        save(editor, result, charaCount);
    }, false);

    btnClear.addEventListener("click", function(){
        clear(editor, result, charaCount);
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
    var btnClassList = target.classList;

    if ( preview.style.display == "none" ) {
        preview.style.display = "";
        editor.style.width = "";
        btnClassList.remove("octicon-chevron-left");
        btnClassList.add("octicon-chevron-right");
    } else {
        preview.style.display = "none";
        editor.style.width = "100%";
        btnClassList.remove("octicon-chevron-right");
        btnClassList.add("octicon-chevron-left");
    }
}

function save(editor, result, charaCount) {
    if (confirm("Save?")) {
        saveStorage(editor);
        keyup(editor, result, charaCount);
    }
}
function clear(editor, result, charaCount) {
    if (confirm("Clear?")) {
        editor.value = "";
        clearStorage();
        keyup(editor, result, charaCount);
    }
}

function saveStorage(element) {
    localStorage.setItem('markunVal', element.value);
}

function loadStorage(element) {
    element.innerHTML = localStorage.getItem('markunVal');
}

function clearStorage() {
    localStorage.removeItem('markunVal');
}
