<template>
    <div class="container">
        <div class="editor-side" v-bind:class="{open:$parent.isOpenEditor}">
            <textarea id="editor" style="display:none" v-model="input" debounce="300"></textarea>
        </div>
        <div class="preview-side" v-if="$parent.isOpenEditor == false">
            <div class="preview markdown-body" v-html="input | markdown" v-if="$parent.previewContents == 0"></div>
            <div class="preview" v-if="$parent.previewContents == 1">
                <textarea class="preview-code" v-html="input | markdown" readonly wrap="soft"></textarea>
            </div>
        </div>
    </div>
</template>

<script>
var render = require('./../js/render.js');
var editor = require("./../js/editor.js");

module.exports = {
    data: function () {
        return {
            input: "",
            file: {
                modify: false,
                path: "",
            },
        }
    },
    init: function() {},
    ready: function() {
        editor.create(document.getElementById("editor"));
        editor.settingEvent();
        editor.settingFormat();
    },
    watch: {
        input: function(val, old) {
            // ウィンドウタイトルに更新マークを付ける
            if (this.file.path != "" && !this.file.modify) {
                this.$parent.setWindowTitle(this.file.path + " (*)");
            }

            this.file.modify = true;  // 編集フラグをオン
        },
        'file.path': function(val, old) {
            // 新規作成以外のとき
            if (val !== "") {
                this.file.modify = false;  // 編集フラグはオフ
            }

            // ウィンドウタイトルへセット
            this.$parent.setWindowTitle(val);
        },
    },
    filters: {
        markdown: function() {
            // プレビュが表示されている時だけMarkdownを変換する
            if ( !this.$parent.isOpenEditor ) {
                // 入力されたMarkdownをHTMLに変換
                var code = render.markdown2code(this.input);
                // チェックしたHTMLを返す
                return render.domSafety(code);
            }
        }
    },
    methods: {
        setEditor: function(content) {
            editor.setValue(content);
        }
    },
};
</script>
