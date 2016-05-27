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
