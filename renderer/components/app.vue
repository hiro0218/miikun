<template>
    <div class="mdl-layout mdl-js-layout">
        <header id="header" class="mdl-layout__header-row mdl-shadow--2dp">
            <nav v-bind:class="{open:isOpenEditor}">
                <div id="editor-tools">
                    <button id="formatBold" data-format="bold" class="mdl-button mdl-js-button mdl-button--icon">
                        <i class="material-icons">format_bold</i>
                    </button>
                    <button id="formatItalic" data-format="italic" class="mdl-button mdl-js-button mdl-button--icon">
                        <i class="material-icons">format_italic</i>
                    </button>
                    <button id="formatStrikethrough" data-format="strikethrough" class="mdl-button mdl-js-button mdl-button--icon">
                        <i class="material-icons">format_strikethrough</i>
                    </button>
                    <button id="formatList_bulleted" data-format="list_bulleted" class="mdl-button mdl-js-button mdl-button--icon">
                        <i class="material-icons">format_list_bulleted</i>
                    </button>
                    <button id="formatList_numbered" data-format="list_numbered" class="mdl-button mdl-js-button mdl-button--icon">
                        <i class="material-icons">format_list_numbered</i>
                    </button>
                    <button id="formatQuote" data-format="quote" class="mdl-button mdl-js-button mdl-button--icon">
                        <i class="material-icons">format_quote</i>
                    </button>
                    <!-- toggle screen -->
                    <button id="btnToggleEditor" class="mdl-button mdl-js-button mdl-button--icon" v-on:click="isOpenEditor=!isOpenEditor">
                        <i class="material-icons" v-if="isOpenEditor">fullscreen_exit</i>
                        <i class="material-icons" v-if="!isOpenEditor">fullscreen</i>
                    </button>
                </div>
            </nav>
            <div class="mdl-layout-spacer"></div>
            <nav v-if="isOpenEditor == false">
                <div class="tabs">
                    <div id="tabPreview" class="tab-list" v-bind:class="{'active': tabContents == 0}" v-on:click="changeTab(0)"><i class="material-icons">visibility</i></div>
                    <div id="tabCode" class="tab-list" v-bind:class="{'active': tabContents == 1}" v-on:click="changeTab(1)"><i class="material-icons">code</i></div>
                </div>
            </nav>
        </header>
        <div class="mdl-layout__drawer">
            <nav class="mdl-navigation">
                <a class="mdl-navigation__link" href="javascript:void(0)" v-on:click="$refs.miiSetting.open()"><i class="material-icons">settings</i> Settings</a>
            </nav>
        </div>
        <main class="mdl-layout__content">
            <div class="container">
                <div class="editor-side" v-bind:class="{open:isOpenEditor}">
                    <textarea id="editor" style="display:none" v-model="input" debounce="300"></textarea>
                </div>
                <div class="preview-side" v-if="isOpenEditor == false">
                    <div class="preview markdown-body" v-html="input | markdown" v-if="tabContents == 0"></div>
                    <div class="preview" v-if="tabContents == 1">
                        <textarea class="preview-code" v-html="input | markdown" readonly wrap="soft"></textarea>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <mdl-snackbar display-on="fileOperation"></mdl-snackbar>
    <mii-tooltip v-ref:mii-tooltip></mii-tooltip>
    <mii-setting v-ref:mii-setting></mii-setting>
</template>

<script>
var render = require('./../js/render.js');
var CodeMirror = require("./../js/editor.js");

var Vue = require('vue');
var VueMdl = require('vue-mdl');
Vue.use(VueMdl.default);

var NProgress = require('nprogress');
NProgress.configure({
    speed: 1000,
    showSpinner: false
});

module.exports = {
    data: function () {
        return {
            input: "",
            isOpenEditor: false,
            tabContents: 0,
            file: {
                modify: false,
                path: "",
            },
        }
    },
    init: function() {
        NProgress.start();
    },
    ready: function() {
        global.editor = CodeMirror.create(document.getElementById("editor"));
        CodeMirror.settingEvent(global.editor);
        CodeMirror.settingFormat();

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
};
</script>
