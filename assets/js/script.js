(function () {
    "use strict";

    // require -----------------------------------------------------
    require("codemirror/lib/codemirror.js");
    require("codemirror/mode/markdown/markdown.js");
    require("codemirror/mode/gfm/gfm.js");
    require("codemirror/mode/xml/xml.js");
    require("codemirror/addon/lint/lint.js");
    require("codemirror/addon/edit/continuelist.js");
    require("codemirror/addon/mode/overlay.js");
    require("codemirror/addon/selection/active-line.js");
    require("codemirror/addon/edit/closebrackets.js");
    var CodeMirror = require('codemirror/lib/codemirror');
    var NProgress = require('nprogress');

    // Global
    window.export = document.getElementById("export");

    document.addEventListener('DOMContentLoaded', function() {
        // NProgress -----------------------------------------------
        NProgress.configure({
            speed: 1000,
            showSpinner: false
        });

        NProgress.start();

        // markdown-it ----------------------------------------------
        initMarkdown();
        NProgress.inc();

    }, false);

    window.addEventListener('load', function(){
        // CodeMirror -----------------------------------------------
        initCodeMirror();
        NProgress.inc();

        // Vue ------------------------------------------------------
        initVue();
        NProgress.inc();

        // NProgress ------------------------------------------------
        NProgress.done();

    }, false);


    function initVue() {
        var Vue = require('vue');
        var VueMdl = require('vue-mdl');
        Vue.use(VueMdl.default);

        var rickdom = new RickDOM();

        window.app = new Vue({
            el: "#app",
            data: {
                input: "",
                isOpenEditor: false,
                tabContents: 0,
            },
            filters: {
                markdown: function() {
                    // プレビュが表示されている時だけMarkdownを変換する
                    if ( this.isOpenEditor ) {
                        return this.input;
                    } else {
                        // Markdownを変換
                        var code = window.markdown.render(this.input);

                        // HTMLをRickDOMに通す
                        var sanitize = rickdom.build(code);
                        var length = sanitize.length;
                        var rendered = "";
                        for (var i = 0; i < length; i++) {
                            var html = sanitize[i].outerHTML;
                            if (html !== undefined) {
                                rendered += html;
                            }
                        }
                        return rendered;
                    }
                }
            },
            methods: {
                changeTab: function(index) {
                    this.tabContents = index;
                },
            },
            components: VueMdl.components,
            directives: VueMdl.directives,
        });
    }

    function initCodeMirror() {
        var rawEditor = document.getElementById("editor");

        var createValidator = require("codemirror-textlint");
        // https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule
        // 一文に利用できる、の数をチェックする
        var maxTen = require("textlint-rule-max-ten");
        // 文中に同じ助詞が複数出てくるのをチェックする
        var noDoubledJoshi = require("textlint-rule-no-doubled-joshi");
        // 「ですます」調と「である」調の混在をチェックする
        var noMixDearuDesumasu = require("textlint-rule-no-mix-dearu-desumasu");
        // 二重否定をチェックする
        var noDoubleNegativeJa = require("textlint-rule-no-double-negative-ja");
        // 見出しは#(h1)から
        // ページの始まり以外の見出しで#(h1)が使われていない。(##, ###,...を利用する。)
        // 見出しの深さ(h1, h2, h3など)は必ず１つずつ増加する。(h1, h3のように急に深くならない)
        var incrementalHeaders = require("textlint-rule-incremental-headers");
        // 同じ接続詞が連続して出現していないかどうかをチェックする
        var noDoubledConjunction = require("textlint-rule-no-doubled-conjunction");
        // 段落内の単語の出現回数をチェックする
        var maxAppearenceCountOfWords = require("textlint-rule-max-appearence-count-of-words");
        // 逆接の接続助詞「が」は、特に否定の意味ではなく同一文中に複数回出現していないかどうかをチェックする
        var noDoubledConjunctiveParticleGa = require("textlint-rule-no-doubled-conjunctive-particle-ga");

        // CodeMirror
        window.editor = CodeMirror.fromTextArea(rawEditor, {
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

        window.editor.on('blur', function(){
            Prism.highlightAll();  // Highlight Re-render
        });

        window.editor.on('change', function(e) {
            window.editor.save();

            // Trigger
            var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
            rawEditor.dispatchEvent(event);

            if (!MODIFY) {  // 編集時フラグを立てる
                MODIFY = true;
            }
        });

    }

    function initMarkdown() {
        var MarkdownIt = require('markdown-it');

        window.markdown = new MarkdownIt({
            html:         true,
            xhtmlOut:     false,
            breaks:       true,
            langPrefix:   'language-',
            linkify:      true,
            typographer:  true,
        })
        .use(require('markdown-it-checkbox'))
        .use(require('markdown-it-footnote'));
    }

})();
