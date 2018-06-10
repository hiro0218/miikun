<template>
  <div :class="{ open: openToolbar }" class="toolbar">
    <div class="menu composite">
      <md-button :disabled="!canUndo" class="md-icon-button" @click="$parent.$refs.miiEditor.undo()">
        <md-icon title="undo">undo</md-icon>
      </md-button>
      <md-button :disabled="!canRedo" class="md-icon-button" @click="$parent.$refs.miiEditor.redo()">
        <md-icon title="redo">redo</md-icon>
      </md-button>
      <md-button :class="{ off: !isPreview }" class="md-icon-button" @click="$parent.$refs.miiEditor.togglePreview()">
        <md-icon title="preview mode">remove_red_eye</md-icon>
      </md-button>
    </div>
    <div class="menu global">
      <md-button class="md-icon-button" disabled>
        <md-icon class="settings">settings</md-icon>
      </md-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

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
  mounted: function() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
@import '../assets/style/common/variables';

.toolbar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 0;
  background: $color200;
  text-align: center;
  transition: all 0.2s;

  > .menu {
    opacity: 0;
  }

  &.open {
    width: 3.125rem;
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
