<template>
    <mdl-dialog title="Settings" v-ref:modal-setting display-on="modalSetting">
        <div>
            <mdl-select id="selectFont" label="Font" :value.sync="font.family.default" :options="font.family.list"></mdl-select>
            <mdl-select id="selectFontSize" label="FontSize" :value.sync="font.size.default" :options="font.size.list"></mdl-select>
        </div>
        <div>
            <mdl-select id="selectTheme" label="Theme" :value.sync="theme.default" :options="theme.list"></mdl-select>
        </div>
        <div>
            <mdl-switch id="switchTextLint" :checked.sync="switchTextLint" value="textlint" checked>text-lint</mdl-switch>
        </div>

        <template slot="actions">
            <mdl-button @click="cancelSetting">Cancel</mdl-button>
            <mdl-button @click="saveSetting" primary>Save</mdl-button>
        </template>
    </mdl-dialog>
</template>

<script>
module.exports = {
    data() {
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
            switchTextLint: this.str2bool(localStorage.getItem(STORAGE.TEXTLINT_KEY)),
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
                window.editor.setOption("lint", this.$parent.getTextLint());
            } else {
                // lint の設定をオフにする
                window.editor.setOption('lint', false);
            }

            this.$refs.modalSetting.close();
        },
        cancelSetting: function() {
            // 値を元に戻す
            this.switchTextLint = this.str2bool(localStorage.getItem(STORAGE.TEXTLINT_KEY));

            this.$refs.modalSetting.close();
        },
        str2bool: function(value) {
            if (typeof value === 'string') {
              value = value.toLowerCase();
            }
            return (value === 'true');
        }
    }
}
</script>
