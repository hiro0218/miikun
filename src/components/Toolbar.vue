<template>
  <div :class="{ open: openToolbar }" :data-toolbar-open="openToolbar" class="toolbar">
    <div class="menu composite">
      <md-button :disabled="!canUndo" class="md-icon-button" @click="undo">
        <font-awesome-icon icon="undo" size="lg" />
      </md-button>
      <md-button :disabled="!canRedo" class="md-icon-button" @click="redo">
        <font-awesome-icon icon="redo" size="lg" />
      </md-button>
      <md-button class="md-icon-button" @click="togglePreview">
        <font-awesome-icon v-if="isPreview" icon="eye" size="lg" />
        <font-awesome-icon v-else icon="eye-slash" size="lg" />
      </md-button>
    </div>
    <div class="menu global">
      <md-button class="md-icon-button" disabled>
        <font-awesome-icon icon="cog" size="lg" />
      </md-button>
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

  &[data-toolbar-open] {
    width: $toolbar-width;
    > .menu {
      opacity: 1;
    }
  }
}

.md-button {
  display: block;
  margin: 0 auto;

  &:disabled {
    opacity: 0.4;
  }

  & + .md-button {
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
