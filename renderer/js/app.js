(function () {
    var Vue = require('vue');
    var VueMdl = require('vue-mdl');
    Vue.use(VueMdl.default);

    var render = require('./renderer/js/render.js');
    var CodeMirror = require("./renderer/js/editor.js");

    window.addEventListener('load', function() {

        window.app = new Vue({
            el: "#app",
            data: {
                input: "",
                isOpenEditor: false,
                tabContents: 0,
                font: {
                    family: {
                        default: 'Noto Sans CJK JP',
                        list: ['Noto Sans CJK JP'],
                    },
                    size: {
                        default: '16',
                        list: [/*'8','9','10','11','12','14',*/'16'/*,'18','20','22','24','26','28','36','48','72'*/],
                    },
                },
                theme: {
                    default: 'Default',
                    list: ['Default'],
                },
                switchTextLint: str2bool(localStorage.getItem(STORAGE.TEXTLINT_KEY)),
            },
            filters: {
                markdown: function() {
                    // プレビュが表示されている時だけMarkdownを変換する
                    if ( this.isOpenEditor ) {
                        return this.input;
                    } else {
                        // 入力されたMarkdownをHTMLに変換
                        this.input = render.markdown2code(this.input);
                        // チェックしたHTMLを返す
                        return render.domSafety(this.input);
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
                openSetting: function() {
                    var self = this;
                    this.$broadcast('modalSetting', self.cancelSetting, self.saveSetting);
                },
                saveSetting: function() {
                    var switchValue = this.switchTextLint;

                    // ストレージに値を保存
                    localStorage.setItem(STORAGE.TEXTLINT_KEY, switchValue);

                    // text-lint オン/オフ
                    if (switchValue) {
                        // lint を再設定する
                        window.editor.setOption("lint", CodeMirror.getTextLint().lint);
                    } else {
                        // lint の設定をオフにする
                        window.editor.setOption('lint', false);
                    }

                },
                cancelSetting: function() {
                    // 値を元に戻す
                    this.switchTextLint = str2bool(localStorage.getItem(STORAGE.TEXTLINT_KEY));
                }
            },
            components: VueMdl.components,
            // components: {
            //     MdlDialog: VueMdl.MdlDialog,
            //     MdlIconToggle: VueMdl.MdlIconToggle,
            //     MdlMenu: VueMdl.MdlMenu,
            //     MdlMenuItem: VueMdl.MdlMenuItem,
            //     MdlSnackbar: VueMdl.MdlSnackbar,
            // },
            directives: VueMdl.directives,
        });

        function str2bool(value) {
            return (value === 'true');
        }

    }, false);
})();
