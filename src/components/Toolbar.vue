<template>
  <div :class="{ open: openToolbar }" :data-open="openToolbar" class="toolbar">
    <div class="menu composite">
      <md-button :disabled="!canUndo" class="md-icon-button" @click="undo">
        <md-icon title="undo">undo</md-icon>
      </md-button>
      <md-button :disabled="!canRedo" class="md-icon-button" @click="redo">
        <md-icon title="redo">redo</md-icon>
      </md-button>
      <md-button :class="{ off: !isPreview }" class="md-icon-button" @click="togglePreview">
        <md-icon title="preview mode">remove_red_eye</md-icon>
      </md-button>
    </div>
    <div class="menu global">
      <md-button class="md-icon-button" disabled> <md-icon class="settings">settings</md-icon> </md-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Menu from '@/modules/menu.js';

export default {
  name: 'MiiToolbar',
  data() {
    return {};
  },
  computed: {
    ...mapState({
      isPreview: state => state.Editor.isPreview,
      openToolbar: state => state.Editor.openToolbar,
      canUndo: state => state.Editor.canUndo,
      canRedo: state => state.Editor.canRedo,
    }),
  },
  watch: {},
  mounted: function() {
    Menu.togglePreview = this.togglePreview;
    Menu.toggleToolbar = this.toggleToolbar;
  },
  methods: {
    undo() {
      Menu.undo();
    },
    redo() {
      Menu.redo();
    },
    togglePreview() {
      this.$store.dispatch('updateIsPreview', !this.isPreview);
    },
    toggleToolbar() {
      this.$store.dispatch('toggleToolbar');
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
  transition: all 0.2s;
  background: $color200;
  text-align: center;

  > .menu {
    opacity: 0;
  }

  &[data-open] {
    width: $toolbar-width;
    > .menu {
      opacity: 1;
    }
  }
}

.md-button {
  display: block;
  margin: 0 auto;

  &:disabled,
  &.off {
    opacity: 0.4;
  }

  & + .md-button {
    margin: 0 auto;
  }
}

.md-icon {
  color: $color600;

  &:hover {
    color: $color900;
  }

  & + .md-icon {
    margin-top: 1rem;
  }
}
</style>
