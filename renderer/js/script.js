require("./renderer/js/def.js");

(function () {
    "use strict";

    var NProgress = require('nprogress');

    document.addEventListener('DOMContentLoaded', function() {
        NProgress.configure({
            speed: 1000,
            showSpinner: false
        });
        NProgress.start();
        NProgress.inc();
    }, false);

    window.addEventListener('load', function(){
        initCodeMirror();

        NProgress.done();
    }, false);

    function initCodeMirror() {
        var CodeMirror = require("./renderer/js/editor.js");
        var textarea = document.getElementById("editor");

        window.editor = CodeMirror.create(textarea);

        window.editor.on('blur', function(){
            Prism.highlightAll();  // Highlight Re-render
        });

        window.editor.on('change', function(e) {
            window.editor.save();

            // Trigger
            var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
            textarea.dispatchEvent(event);

            if (!FILE.MODIFY) {  // 編集時フラグを立てる
                FILE.MODIFY = true;
            }
        });

        CodeMirror.settingFormat();
    }

})();
