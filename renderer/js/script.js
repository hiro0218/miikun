var NProgress = require('nprogress');
NProgress.configure({
    speed: 1000,
    showSpinner: false
});

(function () {
    "use strict";

    document.addEventListener('DOMContentLoaded', function() {
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
