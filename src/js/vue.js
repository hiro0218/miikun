"use strict";

module.exports = {
    rickdom: null,
    init: function() {
        this.initDomSafety();

        return require('vue');
    },
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
            this.rickdom = this.initDomSafety();
        }

        var sanitize = this.rickdom.build(code);
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
