<template>
  <div>
    <md-dialog-prompt
      :md-active.sync="enable"
      v-model="key"
      md-title="Unlock "
      md-input-maxlength="30"
      md-input-placeholder="Password here."
      md-confirm-text="Done"
      @md-confirm="done"
      @md-cancel="cancel" />
  </div>
</template>

<script>
export default {
  name: 'KeyPrompt',
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
