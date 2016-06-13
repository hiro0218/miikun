module.exports = {
    rickdom: null,
    MarkdownIt: null,
    initDomSafety: function() {
        this.rickdom = new RickDOM();

        // ルールを追加
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
        this.rickdom.allowings = Object.assign(this.rickdom.allowings, allowings);
    },
    domSafety: function(code) {
        if (this.rickdom === null) {
            this.initDomSafety();
        }

        var sanitize = this.rickdom.build(code);
        var rendered = "";
        for (var i = 0, length = sanitize.length; i < length; i++) {
            var html = sanitize[i].outerHTML;
            if (html !== undefined) {
                rendered += html;
            }
        }
        sanitize = null;

        return rendered;
    },
    initMarkdown: function() {
        var MarkdownIt = window.require('markdown-it');

        this.MarkdownIt = new MarkdownIt({
            html:         true,
            xhtmlOut:     false,
            breaks:       true,
            langPrefix:   'language-',
            linkify:      true,
            typographer:  true,
        })
        .use(window.require('markdown-it-checkbox'))
        .use(window.require('markdown-it-footnote'));

    },
    markdown2code: function(txt) {
        if (this.MarkdownIt === null) {
            this.initMarkdown();
        }

        return this.MarkdownIt.render(txt);
    }
};
