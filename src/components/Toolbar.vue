<template>
  <div :class="{ open: openToolbar }" class="toolbar">
    <div class="menu" aria-label="Markdown toolbar">
      <div class="menu-section">
        <button type="button" :disabled="!canUndo" aria-label="Undo" title="Undo" @click="undo">
          <font-awesome-icon icon="undo" />
        </button>
        <button type="button" :disabled="!canRedo" aria-label="Redo" title="Redo" @click="redo">
          <font-awesome-icon icon="redo" />
        </button>
      </div>
      <div class="menu-section">
        <span :class="{ disabled: !canEditDocument }" class="heading-control">
          <select
            class="heading-select"
            :disabled="!canEditDocument"
            aria-label="Heading level"
            title="Heading level"
            @change="setHeadingLevel"
          >
            <option value="" disabled selected>H</option>
            <option value="0">Text</option>
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
          </select>
          <font-awesome-icon class="heading-control__icon" icon="chevron-down" aria-hidden="true" />
        </span>
        <button type="button" :disabled="!canEditDocument" aria-label="Bold" title="Bold" @click="toggleBold">
          <font-awesome-icon icon="bold" />
        </button>
        <button type="button" :disabled="!canEditDocument" aria-label="Link" title="Link" @click="insertLink">
          <font-awesome-icon icon="link" />
        </button>
        <button
          type="button"
          :disabled="!canEditDocument"
          aria-label="Bulleted list"
          title="Bulleted list"
          @click="toggleBulletList"
        >
          <font-awesome-icon icon="list-ul" />
        </button>
      </div>
      <div class="menu-section">
        <button
          type="button"
          :class="{ active: isPreview }"
          :disabled="!canPreview"
          :aria-label="previewButtonTitle"
          :aria-pressed="isPreview"
          :title="previewButtonTitle"
          @click="togglePreview"
        >
          <font-awesome-icon v-if="isPreview" icon="eye" />
          <font-awesome-icon v-else icon="eye-slash" />
        </button>
      </div>
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
      activeTabId: (state) => state.Editor.activeTabId,
      cryptEnable: (state) => state.Editor.crypt.enable,
    }),
    canEditDocument() {
      return this.activeTabId != null && !this.cryptEnable;
    },
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
    setHeadingLevel(event) {
      const { value } = event.target;
      if (value !== '') {
        AppMenuController.setHeadingLevel(Number(value));
      }
      event.target.value = '';
    },
    toggleBold() {
      AppMenuController.toggleBold();
    },
    insertLink() {
      AppMenuController.insertLink();
    },
    toggleBulletList() {
      AppMenuController.toggleBulletList();
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
  min-height: 0;
  padding: 0.75rem 0;
  overflow: hidden;
  transition: width 0.2s ease-out;
  background: var(--bg-secondary);

  > .menu {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    transition: opacity 0.15s ease-out;
    opacity: 0;
    scrollbar-width: thin;
  }

  &.open {
    width: $toolbar-width;
    border-right: 1px solid var(--border);
    > .menu {
      opacity: 1;
    }
  }
}

button,
.heading-control {
  width: 36px;
  height: 36px;
  margin: 0 auto;
  transition:
    background-color 0.15s ease-out,
    color 0.15s ease-out;
  border-radius: 8px;
  color: var(--text-muted);
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  & + & {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border);
  }
}

button {
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: var(--code-bg);
    color: var(--text);
  }

  &.active:not(:disabled) {
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

.heading-control {
  position: relative;
  display: block;

  &:hover:not(.disabled) {
    background: var(--code-bg);
    color: var(--text);
  }

  &.disabled {
    opacity: 0.5;
  }

  &__icon {
    position: absolute;
    right: 6px;
    bottom: 7px;
    font-size: 8px;
    pointer-events: none;
  }
}

.heading-select {
  width: 100%;
  height: 100%;
  padding: 0 0.5rem 0 0;
  border-radius: inherit;
  color: inherit;
  font-size: $font-size-sm;
  font-weight: 600;
  text-align: center;
  text-align-last: center;
  cursor: pointer;
  appearance: none;

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  &:disabled {
    cursor: default;
  }
}
</style>
