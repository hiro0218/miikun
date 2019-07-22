<template>
  <md-dialog :md-active.sync="enable" @md-opened="onOpen">
    <md-dialog-title>{{ title }}</md-dialog-title>
    <md-dialog-content>
      <md-field>
        <label>Password is required</label>
        <md-input v-model="key" maxlength="50" type="password" />
      </md-field>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="done">OK</md-button>
      <md-button class="md-primary" @click="cancel">Cancel</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
export default {
  name: 'KeyPrompt',
  data: function() {
    return {
      title: '',
    };
  },
  computed: {
    enable: {
      get: function() {
        return this.$store.state.Editor.crypt.enable;
      },
      set: function(v) {
        this.$store.dispatch('setCryptEnable', v);
      },
    },
    key: {
      get: function() {
        return this.$store.state.Editor.crypt.key;
      },
      set: function(v) {
        this.$store.dispatch('setCryptKey', v);
      },
    },
  },
  methods: {
    done() {
      this.enable = false;
      this.$emit('done', this.key);
    },
    cancel() {
      this.enable = false;
      this.$emit('done', null);
    },
    onOpen() {
      let fname = this.$store.state.Editor.crypt.op.path;
      let opname = this.$store.state.Editor.crypt.op.name;

      if (typeof fname === 'string' && typeof opname === 'string') {
        fname = fname.split('/').pop();
        opname = opname.charAt(0).toUpperCase() + opname.slice(1);
        this.title = opname + ' ' + fname;
      } else {
        // Unexpected situation
        this.title = 'Unkown operation';
      }
    },
  },
};
</script>
