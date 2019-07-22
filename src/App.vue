<template>
  <div id="app">
    <toolbar />
    <router-view />
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar';

export default {
  name: 'Miikun',
  components: {
    Toolbar,
  },
};
</script>

<style lang="scss">
@import '~vue-material/dist/vue-material.min.css';
@import '~vue-material/dist/theme/default.css';
@import '@/assets/style/main.scss';

#app {
  display: flex;
  background: #fff;
}
</style>
