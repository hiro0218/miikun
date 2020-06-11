<template>
  <div id="app">
    <toolbar />
    <router-view />
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar';
import { name } from '../package.json';

export default {
  name: 'Miikun',
  metaInfo: {
    titleTemplate: function (titleChunk) {
      return titleChunk.trim() ? `${titleChunk} - ${name}` : name;
    },
  },
  components: {
    Toolbar,
  },
};
</script>

<style lang="scss">
@import '@/assets/style/main.scss';

#app {
  display: flex;
  flex-direction: initial;
  background: #fff;
}
</style>
