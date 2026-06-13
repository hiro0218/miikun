<template>
  <div :class="{ open: openToolbar }" class="toolbar">
    <div class="menu">
      <button type="button" :disabled="!canUndo" aria-label="Undo" title="Undo" @click="undo">
        <font-awesome-icon icon="undo" />
      </button>
      <button type="button" :disabled="!canRedo" aria-label="Redo" title="Redo" @click="redo">
        <font-awesome-icon icon="redo" />
      </button>
      <button
        type="button"
        :disabled="!canPreview"
        :aria-label="previewButtonTitle"
        :title="previewButtonTitle"
        @click="togglePreview"
      >
        <font-awesome-icon v-if="isPreview" icon="eye" />
        <font-awesome-icon v-else icon="eye-slash" />
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import AppMenuController from '@/services/app-menu-controller';

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
      canPreview: (state) => state.Editor.canPreview,
    }),
    previewButtonTitle() {
      if (!this.canPreview) return 'Preview unavailable';
      return this.isPreview ? 'Hide preview' : 'Show preview';
    },
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
  width: 0;
  padding: 0.75rem 0;
  overflow: hidden;
  transition: width 0.2s ease-out;
  background: var(--bg-secondary);

  > .menu {
    transition: opacity 0.15s ease-out;
    opacity: 0;
  }

  &.open {
    width: $toolbar-width;
    border-right: 1px solid var(--border);
    > .menu {
      opacity: 1;
    }
  }
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 auto;
  transition:
    background-color 0.15s ease-out,
    color 0.15s ease-out;
  border-radius: 8px;
  color: var(--text-muted);

  & + button {
    margin-top: 0.5rem;
  }

  &:hover:not(:disabled) {
    background: var(--code-bg);
    color: var(--text);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .svg-inline--fa {
    font-size: 14px;
  }
}
</style>
