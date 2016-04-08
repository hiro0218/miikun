var STORAGE_KEYNAME = "MiiKun";

var Vue = require('vue');
var createValidator = require("codemirror-textlint");
var MarkdownIt = require('markdown-it');

(function () {
    // Global
    window.editor = document.getElementById("editor");
    window.result = document.getElementById("result");

    // Progress bar
    NProgress.configure({
        speed: 1000,
        showSpinner: false
    });
    NProgress.start();

})();

window.onload = function() {
    "use strict";

    // プラグイン関連の初期設定
    initPlugin();

    // Vue
    window.app = new Vue({
        el: "#app",
        data: {
            input: "",
            isOpenEditor: false,
        },
        filters: {
            markdown: function() {
                return getMarkedValue(this.input);
            }
        },
        methods: {
            convertData: function(e) {
                showHTML();
            }
        }

    });

    app.$watch('input', function(value) {
        Prism.highlightAll();  // Highlight Re-render
    });

    NProgress.done();
};

// function
function initPlugin() {
    // https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule
    var maxTen = require("textlint-rule-max-ten");
    var noDoubledJoshi = require("textlint-rule-no-doubled-joshi");
    var noMixDearuDesumasu = require("textlint-rule-no-mix-dearu-desumasu");
    var noDoubleNegativeJa = require("textlint-rule-no-double-negative-ja");
    var incrementalHeaders = require("textlint-rule-incremental-headers");
    var noDoubledConjunction = require("textlint-rule-no-doubled-conjunction");
    var maxAppearenceCountOfWords = require("textlint-rule-max-appearence-count-of-words");
    var noDoubledConjunctiveParticleGa = require("textlint-rule-no-doubled-conjunctive-particle-ga");

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
        autoCloseBrackets: true,
        extraKeys: {
            "Enter": "newlineAndIndentContinueMarkdownList"
        },
        gutters: ["CodeMirror-lint-markers"],
        lint: {
            "getAnnotations": createValidator({
                rules: {
                    "max-ten": maxTen,
                    "no-doubled-joshi": noDoubledJoshi,
                    "no-mix-dearu-desumasu": noMixDearuDesumasu,
                    "no-double-negative-ja": noDoubleNegativeJa,
                    "no-doubled-conjunction": noDoubledConjunction,
                    "incremental-headers": incrementalHeaders.default,
                    "no-doubled-conjunctive-particle-ga": noDoubledConjunctiveParticleGa,
                    "textlint-rule-max-appearence-count-of-words": maxAppearenceCountOfWords,
                }
            }),
            "async": true
        }
    });

    window.cm.on('change', function(e) {
        window.cm.save();

        // Trigger
        var event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, false);
        window.editor.dispatchEvent(event);

        // 編集時フラグを立てる
        if (!MODIFY) {
            MODIFY = true;
        }
    });

    // markdownit
    window.md = new MarkdownIt({
        html:         true,
        xhtmlOut:     false,
        breaks:       true,
        langPrefix:   'language-',
        linkify:      true,
        typographer:  true,
    }).use(require('markdown-it-checkbox'));

}

function getMarkedValue(value) {
    // エスケープされていない<script>タグを消去
    value = stripScriptTag(value);

    return window.md.render(value);
}

function stripScriptTag(text) {
    var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    while(SCRIPT_REGEX.test(text)) {
        text = text.replace(SCRIPT_REGEX, "");
    }
    return text;
}

function showHTML() {
    var editorValue = window.editor.value;
    if (editorValue) {
        var htmlValue = getMarkedValue(editorValue);
        basicModal.show({
            body: '<textarea id="export" onclick="this.select(0,this.value.length);">'+ htmlValue +'</textarea>',
            buttons: {
                action: {
                    title: 'Close',
                    fn: basicModal.close
                }
            }
        });
    }
}


// function save() {
//     if (window.confirm("Save?")) {
//         saveStorage(window.editor.value);
//         setPreview();
//     }
// }
// function clear() {
//     if (window.confirm("Clear?")) {
//         cm.getDoc().setValue('');
//         window.editor.value = "";
//         clearStorage();
//         setPreview();
//     }
// }

// function saveStorage(element) {
//     localStorage.setItem(STORAGE_KEYNAME, element);
// }
//
// function loadStorage(element) {
//     element.innerHTML = localStorage.getItem(STORAGE_KEYNAME);
// }
//
// function clearStorage() {
//     localStorage.removeItem(STORAGE_KEYNAME);
// }
