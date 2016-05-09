(function () {
    "use strict";

    var NProgress = require('nprogress');

    document.addEventListener('DOMContentLoaded', function() {
        NProgress.configure({
            speed: 1000,
            showSpinner: false
        });
        NProgress.start();

        initMarkdown();
        NProgress.inc();

    }, false);

    window.addEventListener('load', function(){
        initCodeMirror();
        NProgress.inc();

        initVue();
        NProgress.inc();

        NProgress.done();

    }, false);


    function initVue() {
        var vuejs = require('./src/js/vue.js');

        var Vue = vuejs.init();
        var VueMdl = require('vue-mdl');
        Vue.use(VueMdl.default);

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
                        // 入力されたMarkdownをHTMLに変換
                        var code = window.markdown.render(this.input);

                        return vuejs.domSafety(code);
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
        var textarea = document.getElementById("editor");

        var CodeMirror = require("./src/js/codemirror.js");
        var cm = CodeMirror.init();
        window.editor = CodeMirror.create(cm, textarea);

        window.editor.on('blur', function(){
            Prism.highlightAll();  // Highlight Re-render
        });

        window.editor.on('change', function(e) {
            window.editor.save();

            // Trigger
            var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
            textarea.dispatchEvent(event);

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
