var def = require('./def.js');
global.STORAGE = def.STORAGE;

var NProgress = require('nprogress');
NProgress.configure({
    speed: 1000,
    showSpinner: false
});

(function () {
    var render = require('./render.js');
    var CodeMirror = require("./editor.js");

    var Vue = require('vue');
    var VueMdl = require('vue-mdl');
    Vue.use(VueMdl.default);

    setVueComponent();
    setEditor();

    window.addEventListener('load', function() {

        window.app = new Vue({
            el: "#app",
            data: {
                input: "",
                isOpenEditor: false,
                tabContents: 0,
                file: {
                    modify: false,
                    path: "",
                },
            },
            init: function() {
                NProgress.start();
            },
            ready: function() {
                NProgress.done();
            },
            watch: {
                input: function(val, old) {
                    this.file.modify = true;
                },
                'file.path': function(val, old) {
                    // ファイルパスが変更された際は編集フラグはオフ
                    this.file.modify = false;
                },
            },
            filters: {
                markdown: function() {
                    // プレビュが表示されている時だけMarkdownを変換する
                    if ( !this.isOpenEditor ) {
                        // 入力されたMarkdownをHTMLに変換
                        var code = render.markdown2code(this.input);
                        // チェックしたHTMLを返す
                        return render.domSafety(code);
                    }
                }
            },
            methods: {
                changeTab: function(index) {
                    this.tabContents = index;
                },
                openSnackbar: function(msg){
                    this.$broadcast('fileOperation', {
                        message: msg,
                        timeout: 1000,
                    });
                },
                getTextLint: function() {
                    return CodeMirror.getTextLint().lint;
                },
            },
            components: VueMdl.components,
            directives: VueMdl.directives,
        });


    }, false);

    function setVueComponent() {
        // ツールチップ
        Vue.component("mii-tooltip", function(resolve) {
            require(['./../components/tooltip.vue'], resolve)
        });

        // 設定画面
        Vue.component("mii-setting", function(resolve) {
            require(['./../components/setting.vue'], resolve)
        });
    }

    function setEditor() {
        window.editor = CodeMirror.create(document.getElementById("editor"));
        CodeMirror.settingEvent(window.editor);
        CodeMirror.settingFormat();
    }

})();
