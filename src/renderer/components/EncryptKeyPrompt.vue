<template>
  <div>
    <input v-model="key" type="password" placeholder="Enter key...">
    <input :disabled="key.trim().length === 0" type="button" value="⮐" @click="ok">
    <input type="button" value="X" @click="cancel">
  </div>
</template>

<script>
export default {
  name: 'MiiEncryptKeyPrompt',
  data() {
    return {
      key: '',
    };
  },
  methods: {
    ok() {
      this.$electron.ipcRenderer.sendSync('set-key', this.key);
    },
    cancel() {
      this.$electron.ipcRenderer.sendSync('set-key', null);
    },
  },
};
</script>

<style scoped>
::placeholder {
  /* Most modern browsers support this now. */
  color: darkgrey;
}
input[type='button'] {
  padding: 0;
  background: none;
  border: none;
}
input[type='password'] {
  line-height: 2em;
}
</style>
