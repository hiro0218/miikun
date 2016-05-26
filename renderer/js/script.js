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

        window.editor = CodeMirror.create(document.getElementById("editor"));
        CodeMirror.settingEvent(window.editor);
        CodeMirror.settingFormat();
    }

})();
