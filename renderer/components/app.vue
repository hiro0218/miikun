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
                    <div id="tabPreview" class="tab-list" v-bind:class="{'active': previewContents == 0}" v-on:click="changePreviewTab(0)"><i class="material-icons">visibility</i></div>
                    <div id="tabCode" class="tab-list" v-bind:class="{'active': previewContents == 1}" v-on:click="changePreviewTab(1)"><i class="material-icons">code</i></div>
                </div>
            </nav>
        </header>
        <main class="mdl-layout__content">
            <mii-editor v-ref:editor></mii-editor>
        </main>
        <div class="mdl-layout__drawer">
            <nav class="mdl-navigation">
                <a class="mdl-navigation__link" href="javascript:void(0)" v-on:click="$refs.miiSetting.open()"><i class="material-icons">settings</i> Settings</a>
            </nav>
        </div>
    </div>
    <mdl-snackbar display-on="fileOperation"></mdl-snackbar>
    <mii-tooltip v-ref:mii-tooltip></mii-tooltip>
    <mii-setting v-ref:mii-setting></mii-setting>
</template>

<script>
var editor = require("./../js/editor.js");

// NProgress
var NProgress = require('nprogress');
NProgress.configure({
    speed: 1000,
    showSpinner: false
});

var Vue = require('vue');
var VueMdl = require('vue-mdl');
Vue.use(VueMdl.default);

module.exports = {
    data: function () {
        return {
            isOpenEditor: false,
            previewContents: 0,
        }
    },
    init: function() {
        NProgress.start();

        //
        this.$electron.remote.BrowserWindow.getFocusedWindow().setTitle("");
    },
    ready: function() {
        NProgress.done();
    },
    watch: {},
    filters: {},
    methods: {
        setWindowTitle: function(title) {
            title = (title != "") ? title : "Untitled Document";
            this.$electron.remote.BrowserWindow.getFocusedWindow().setTitle(title);
        },
        changePreviewTab: function(index) {
            this.previewContents = index;
        },
        openSnackbar: function(msg){
            this.$broadcast('fileOperation', {
                message: msg,
                timeout: 1000,
            });
        },
        getTextLint: function() {
            return editor.getTextLint().lint;
        },
    },
    components: VueMdl.components,
    directives: VueMdl.directives,
};
</script>
