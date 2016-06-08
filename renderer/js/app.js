(function () {
    var Vue = require('vue');

    var VueMdl = require('vue-mdl');
    Vue.use(VueMdl.default);

    var render = require('./render.js');
    var CodeMirror = require("./editor.js");

    setVueComponent();

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
            },
            components: VueMdl.components,
            directives: VueMdl.directives,
        });


    }, false);

    function setVueComponent() {
        // ツールチップ
        Vue.component("mii-tooltip", function(resolve) {
            getData("./renderer/components/tooltip.vue", function(contents) {
                resolve({
                    template: contents,
                });
            });
        });

        // 設定画面
        Vue.component("mii-setting", function(resolve) {
            getData("./renderer/components/setting.vue", function(contents) {
                resolve({
                    template: contents,
                    data: function() {
                        return {
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
                        }
                    },
                    methods: {
                        open: function() {
                            this.$refs.modalSetting.open();
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

                            this.$refs.modalSetting.close();
                        },
                        cancelSetting: function() {
                            // 値を元に戻す
                            this.switchTextLint = str2bool(localStorage.getItem(STORAGE.TEXTLINT_KEY));

                            this.$refs.modalSetting.close();
                        }
                    }
                });
            });
        });
    }

    function str2bool(value) {
        if (typeof value === 'string') {
          value = value.toLowerCase();
        }
        return (value === 'true');
    }

    function getData(url, callbak) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4) {
                callbak(xhr.status == 200 ? xhr.responseText : null);
            }
        }
        xhr.open("GET", url, true);
        xhr.send();
    }

})();
