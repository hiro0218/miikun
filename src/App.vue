<template>
  <div id="app">
    <toolbar />
    <router-view />
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar';

export default {
  name: 'MiikunApp',
  components: {
    Toolbar,
  },
};
</script>

<style lang="scss">
@use '@/assets/style/main.scss';

#app {
  display: flex;
  flex-direction: initial;
  background: var(--bg);
}
</style>
