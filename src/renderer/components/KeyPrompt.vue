<template>
  <div>
    <md-dialog-prompt
      :md-active.sync="enable"
      v-model="key"
      :md-title.sync="title"
      md-input-maxlength="30"
      md-input-placeholder="Password is required"
      @md-confirm="done"
      @md-cancel="cancel" />
  </div>
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
  watch: {
    enable: function() {
      let fname = this.$store.state.Editor.crypt.op.path.split('/').pop();
      let opname = this.$store.state.Editor.crypt.op.name;
      opname = opname.charAt(0).toUpperCase() + opname.slice(1);
      this.title = opname + ' ' + fname;
    },
  },
  methods: {
    done() {
      this.$emit('done', this.key);
    },
    cancel() {
      this.$emit('done', null);
    },
  },
};
</script>

<style scoped>
</style>
