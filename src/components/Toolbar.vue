<template>
  <div :class="{ open: openToolbar }" :data-toolbar-open="openToolbar" class="toolbar">
    <div class="menu composite">
      <v-btn flat icon :disabled="!canUndo" @click="undo">
        <font-awesome-icon icon="undo" size="lg" />
      </v-btn>
      <v-btn flat icon :disabled="!canRedo" @click="redo">
        <font-awesome-icon icon="redo" size="lg" />
      </v-btn>
      <v-btn flat icon @click="togglePreview">
        <font-awesome-icon v-if="isPreview" icon="eye" size="lg" />
        <font-awesome-icon v-else icon="eye-slash" size="lg" />
      </v-btn>
    </div>
    <div class="menu global">
      <v-btn flat icon disabled>
        <font-awesome-icon icon="cog" size="lg" />
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Menu from '@/lib/menu.js';

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
    // View
    const subMenu = Menu.menubar[3].submenu;
    Menu.registerMenuItemFunc(subMenu, 'toggle_preview_panel', { click: this.togglePreview, checked: this.isPreview });
    Menu.registerMenuItemFunc(subMenu, 'toggle_toolbar', { click: this.toggleToolbar, checked: this.openToolbar });
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

.v-btn {
  display: block;
  margin: 0 auto;

  &:disabled {
    opacity: 0.4;
  }

  & + .v-btn {
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
