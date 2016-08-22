<style scoped>
@import 'https://fonts.googleapis.com/icon?family=Material+Icons';
@import 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600';
</style>

<template>
  <toolbar v-ref:mii-toolbar></toolbar>
  <editor v-ref:mii-editor></editor>
  <statusbar v-ref:mii-statusbar></statusbar>
</template>

<script>
  import Toolbar from './Toolbar'
  import Editor from './Editor'
  import Statusbar from './Statusbar'

  var menu = require('../modules/menu.js')

  export default {
    name: 'mii-main',
    methods: {},
    ready () {
      var miiToolbar = this.$refs.miiToolbar
      menu.newFile = function () { miiToolbar.newFile() }
      menu.openFile = function () { miiToolbar.openFile() }
      menu.saveFile = function () { miiToolbar.save() }
      menu.saveAsFile = function () { miiToolbar.saveAs() }
      menu.ready()
    },
    components: {
      Toolbar,
      Editor,
      Statusbar
    }
  }
</script>
