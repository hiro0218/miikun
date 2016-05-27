"use strict";

module.exports = {
    cm: null,
    load: function() {
        require("codemirror/mode/gfm/gfm.js");
        require("codemirror/mode/markdown/markdown.js");
        require("codemirror/mode/xml/xml.js");
        require("codemirror/addon/edit/continuelist.js");
        require("codemirror/addon/edit/closebrackets.js");
        require("codemirror/addon/lint/lint.js");
        require("codemirror/addon/mode/overlay.js");
        require("codemirror/addon/selection/active-line.js");
    },
    rule: {
        // 一文に利用できる、の数をチェックする
        maxTen: require("textlint-rule-max-ten"),
        // 文中に同じ助詞が複数出てくるのをチェックする
        noDoubledJoshi: require("textlint-rule-no-doubled-joshi"),
        // 「ですます」調と「である」調の混在をチェックする
        noMixDearuDesumasu: require("textlint-rule-no-mix-dearu-desumasu"),
        // 二重否定をチェックする
        noDoubleNegativeJa: require("textlint-rule-no-double-negative-ja"),
        // 見出しは#(h1)から
        // ページの始まり以外の見出しで#(h1)が使われていない。(##, ###,...を利用する。)
        // 見出しの深さ(h1, h2, h3など)は必ず１つずつ増加する。(h1, h3のように急に深くならない)
        incrementalHeaders: require("textlint-rule-incremental-headers").default,
        // 同じ接続詞が連続して出現していないかどうかをチェックする
        noDoubledConjunction: require("textlint-rule-no-doubled-conjunction"),
        // 段落内の単語の出現回数をチェックする
        maxAppearenceCountOfWords: require("textlint-rule-max-appearence-count-of-words"),
        // 逆接の接続助詞「が」は、特に否定の意味ではなく同一文中に複数回出現していないかどうかをチェックする
        noDoubledConjunctiveParticleGa: require("textlint-rule-no-doubled-conjunctive-particle-ga"),
    },
    init: function() {
        this.load();
        return require('codemirror/lib/codemirror');
    },
    create: function(textarea) {
        if (this.cm === null) {
            this.cm = this.init();
        }

        var options = this.createOption(this._str2bool(localStorage.getItem(STORAGE.TEXTLINT_KEY)));
        return this.cm.fromTextArea(textarea, options);
    },
    createOption: function(textlint) {
        textlint = (textlint === null) ? false : textlint;

        var options = {
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
            }
        };

        if (textlint === true) {
            options = Object.assign(options, this.getTextLint());
        }

        return options;
    },
    getTextLint: function() {
        var createValidator = require("codemirror-textlint");
        return {
            lint: {
                "getAnnotations": createValidator({
                    rules: {
                        "max-ten": this.rule.maxTen,
                        "no-doubled-joshi": this.rule.noDoubledJoshi,
                        "no-mix-dearu-desumasu": this.rule.noMixDearuDesumasu,
                        "no-double-negative-ja": this.rule.noDoubleNegativeJa,
                        "no-doubled-conjunction": this.rule.noDoubledConjunction,
                        "incremental-headers": this.rule.incrementalHeaders,
                        "no-doubled-conjunctive-particle-ga": this.rule.noDoubledConjunctiveParticleGa,
                        "textlint-rule-max-appearence-count-of-words": this.rule.maxAppearenceCountOfWords,
                    }
                }),
                "async": true
            }
        }
    },
    settingEvent: function(target) {
        target.on('blur', function(){
            Prism.highlightAll();  // Highlight Re-render
        });

        target.on('change', function(e) {
            target.save();

            // Trigger
            target.getTextArea().dispatchEvent(new Event('change'));
        });
    },
    settingFormat: function() {
        var self = this;
        var tools = document.getElementById("editor-tools");
        var buttons = tools.getElementsByTagName("button");

        for (let i = 0, len = buttons.length; i < len; i++) {
            buttons[i].addEventListener('click', function(e) {
                var type = this.getAttribute('data-format');
                var value = window.editor.getSelection();

                if (value) {
                    switch(type) {
                        case 'bold':
                        self._replaceSelection('**' + value + '**');
                        break;
                        case 'italic':
                        self._replaceSelection('*' + value + '*');
                        break;
                        case 'strikethrough':
                        self._replaceSelection('~~' + value + '~~');
                        break;
                        case 'list_bulleted':
                        self._formatListValue(value, "bullet");
                        break;
                        case 'list_numbered':
                        self._formatListValue(value, "number");
                        break;
                        case 'quote':
                        self._replaceSelection("\n\n> " + value +"\n\n");
                        break;
                    }
                }
            });
        }
    },
    _formatListValue(value, type) {
        var tag = (type === "number") ? "1. " : "* ";
        var arr = value.split(/\r\n|\r|\n/);
        var len = arr.length;

        for (let i = 0; i < len; i++) {
            if (type === "number") {  // 番号を増やす
                tag = (i+1) + ". ";
            }
            var val = "\n" + tag + arr[i];
            if (i === len-1) {  // 最後の行だけ改行
                val += "\n";
            }
            this._replaceSelection(val);
        }
    },
    _replaceSelection(value) {
        window.editor.replaceSelection(value);
    },
    _str2bool: function(value) {
        return (value.toLowerCase() === 'true');
    }
}
