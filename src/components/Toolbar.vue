<template>
  <div :class="{ open: openToolbar }" :data-toolbar-open="openToolbar" class="toolbar">
    <div class="menu composite">
      <button :disabled="!canUndo" @click="undo">
        <font-awesome-icon icon="undo" size="" />
      </button>
      <button :disabled="!canRedo" @click="redo">
        <font-awesome-icon icon="redo" size="" />
      </button>
      <button @click="togglePreview">
        <font-awesome-icon v-if="isPreview" icon="eye" size="" />
        <font-awesome-icon v-else icon="eye-slash" size="" />
      </button>
    </div>
    <div class="menu global">
      <button disabled>
        <font-awesome-icon icon="cog" size="" />
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AppMenuController from '@/service/app-menu-controller';

export default {
  name: 'MiiToolbar',
  data() {
    return {};
  },
  computed: {
    ...mapState({
      isPreview: (state) => state.Editor.isPreview,
      openToolbar: (state) => state.Editor.openToolbar,
      canUndo: (state) => state.Editor.canUndo,
      canRedo: (state) => state.Editor.canRedo,
    }),
  },
  watch: {},
  methods: {
    undo() {
      AppMenuController.undo();
    },
    redo() {
      AppMenuController.redo();
    },
    togglePreview() {
      AppMenuController.togglePreview();
    },
    toggleToolbar() {
      AppMenuController.toggleToolbar();
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 0;
  padding: 0.5rem 0;
  transition: all 0.2s;
  background: $color200;
  text-align: center;

  > .menu {
    opacity: 0;
  }

  &[data-toolbar-open] {
    width: $toolbar-width;
    > .menu {
      opacity: 1;
    }
  }
}

button {
  display: block;
  margin: 0 auto;

  &:disabled {
    opacity: 0.4;
  }

  & + button {
    margin: 1rem auto 0;
  }

  .svg-inline--fa path {
    fill: $color600;
  }

  &:hover {
    .svg-inline--fa path {
      fill: $color900;
    }
  }
}
</style>
