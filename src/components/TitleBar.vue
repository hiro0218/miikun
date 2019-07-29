<template>
  <div class="draggable-title-bar">
    {{ filePath }}
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'TitleBar',
  computed: {
    ...mapState({
      filePath: state => {
        return state.Editor.filePath;
      },
    }),
  },
};
</script>

<style lang="scss">
.draggable-title-bar {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: $title-bar-height;
  font-size: 0.85rem;
  text-align: center;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
</style>
