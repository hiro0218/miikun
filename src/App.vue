<template>
  <v-app id="app">
    <toolbar />
    <router-view />
  </v-app>
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
@import '@/assets/style/main.scss';

#app .application--wrap {
  display: flex;
  flex-direction: initial;
  background: #fff;
}
</style>
