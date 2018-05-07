<template>
  <div>
    <input type="password" v-model="key" placeholder="Enter key...">
    <input type="button" value="⮐" v-on:click="ok" v-bind:disabled="key.trim().length === 0">
    <input type="button" value="X" v-on:click="cancel">
  </div>
</template>

<script>
  const { ipcRenderer } = require('electron')
  export default {
    name: 'mii-encrypt-key-prompt',
    data () {
      return {
        key: ''
      }
    },
    methods: {
      ok () {
        ipcRenderer.sendSync('set-key', this.key)
      },
      cancel () {
        ipcRenderer.sendSync('set-key', '')
      }
    }
  }
</script>

<style scoped>
::placeholder { /* Most modern browsers support this now. */
   color:darkgrey
}
dev {
  width:100%;
  height:100%;
  display:box;
  box-orient:horizontal;
  box-pack:center;
  box-align:center;
}
input[type="button"] {
  padding: 0;
  background: none;
  border: none;
}
input[type="password"] {
  line-height: 2em;
}
</style>
