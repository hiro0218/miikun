var STORAGE_KEYNAME = "MiiKun";

window.onload = function() {
    "use strict";

    // Global
    window.editor = document.getElementById("editor");
    window.result = document.getElementById("result");

    // 宣言
    var modal  = document.getElementById('modal');
    var output = document.getElementById('export');
    var charaCount = document.getElementById('chara-count');
    var btnPreview = document.getElementsByClassName('btn-preview')[0];
    var btnToggle  = document.getElementsByClassName('btn-toggle')[0];

    // ストレージから読み込む
    // loadStorage(editor);

    // ストレージに保存する
    // window.setInterval(function(){
    //     saveStorage(editor);
    // }, 60000);

    // プラグイン関連の初期設定
    initPlugin();

    editor.addEventListener("change", function(){
        setPreview();
    }, false);

    // 初回実行
    if (editor.value) {
        setPreview();
    }

    // ページ移動の確認
    // window.onbeforeunload = function(event){
    //     event = event || window.event;
    //     event.returnValue = 'Confirmation';
    // };

    // tool
    btnPreview.addEventListener("click", function(){
        // export html
        output.value = getMarkedValue(editor.value);

        // show modal
        modal.style.display = "block";
    }, false);

    output.addEventListener("focus", function() {
        output.select();
    }, false);

    btnToggle.addEventListener("click", function(e) {
        togglePreview(e.target);
    }, false);

    // Modal
    window.addEventListener("click", function(e) {
        if (e.target == modal) {
            // hide modal
            modal.style.display = "none";
        }
    }, false);

};

// function
function initPlugin() {
    // CodeMirror
    window.cm = window.CodeMirror.fromTextArea(window.editor, {
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
        dragDrop: false,
        extraKeys: {
            "Enter": "newlineAndIndentContinueMarkdownList"
        }
    });
    cm.on('change', function(e) {
        // Trigger
        var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
        window.editor.dispatchEvent(event);

        window.editor.value = cm.getValue();
    });

    // marked
    window.marked.setOptions({
        langPrefix: 'language-',
        breaks: true
    });
}

function getMarkedValue(value) {
    // エスケープされていない<script>タグを消去
    value = stripScriptTag(value);

    return marked(value);
}

function setPreview() {
    // HTML変換
    var mkval = getMarkedValue(window.editor.value);

    // 文字数カウント
    setTextCount(mkval);

    // 反映
    window.result.innerHTML = mkval;

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

function setTextCount(mkval) {
    var charaCount = document.getElementById('chara-count');
    charaCount.innerHTML = mkval.length;
}


function togglePreview(target) {
    var previewSide = document.getElementsByClassName('preview-side')[0];
    var editorSide  = document.getElementsByClassName('editor-side')[0];
    var btnClassList = target.classList;

    if ( previewSide.style.display == "none" ) {
        previewSide.style.display = "";
        editorSide.style.width = "";
        btnClassList.remove("octicon-chevron-left");
        btnClassList.add("octicon-chevron-right");
    } else {
        previewSide.style.display = "none";
        editorSide.style.width = "100%";
        btnClassList.remove("octicon-chevron-right");
        btnClassList.add("octicon-chevron-left");
    }
}

function save() {
    if (window.confirm("Save?")) {
        saveStorage(window.editor.value);
        setPreview();
    }
}
function clear() {
    if (window.confirm("Clear?")) {
        cm.getDoc().setValue('');
        window.editor.value = "";
        clearStorage();
        setPreview();
    }
}

function saveStorage(element) {
    localStorage.setItem(STORAGE_KEYNAME, element);
}

function loadStorage(element) {
    element.innerHTML = localStorage.getItem(STORAGE_KEYNAME);
}

function clearStorage() {
    localStorage.removeItem(STORAGE_KEYNAME);
}
