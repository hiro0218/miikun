(function () {
    "use strict";

    var NProgress = require('nprogress');

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
        var allowings = {
            "a": {
                "id": "",
                "href": "",
            },
            "li": {
                "id": "",
                "value": { "pattern" : "^-?[\\d]+$" }
            },
            "input" : {
                "id": "",
                "type": "checkbox",
                "checked": "",
            },
            "label": {
                "for": ""
            }
        };
        rickdom.allowings = Object.assign(rickdom.allowings, allowings);

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
