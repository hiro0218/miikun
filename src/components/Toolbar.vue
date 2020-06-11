<template>
  <div :class="{ open: openToolbar }" :data-toolbar-open="openToolbar" class="toolbar">
    <div class="menu composite">
      <button text icon :disabled="!canUndo" @click="undo">
        <font-awesome-icon icon="undo" size="lg" />
      </button>
      <button text icon :disabled="!canRedo" @click="redo">
        <font-awesome-icon icon="redo" size="lg" />
      </button>
      <button text icon @click="togglePreview">
        <font-awesome-icon v-if="isPreview" icon="eye" size="lg" />
        <font-awesome-icon v-else icon="eye-slash" size="lg" />
      </button>
    </div>
    <div class="menu global">
      <button text icon disabled>
        <font-awesome-icon icon="cog" size="lg" />
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
    margin: 0.5rem auto 0;
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
