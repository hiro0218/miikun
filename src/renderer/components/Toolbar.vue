<template>
  <div class="toolbar">
    <div class="composite">
      <md-button class="md-icon-button" @click="undo">
        <md-icon title="undo">undo</md-icon>
      </md-button>
      <md-button class="md-icon-button" @click="redo">
        <md-icon title="redo">redo</md-icon>
      </md-button>
      <md-button :class="{ off: !isPreview }" class="md-icon-button" @click="togglePreview">
        <md-icon title="preview mode">remove_red_eye</md-icon>
      </md-button>
    </div>
    <div class="global">
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
    }),
  },
  watch: {},
  mounted: function() {},
  methods: {
    undo() {
      this.$parent.$refs['mii-editor'].undo();
    },
    redo() {
      this.$parent.$refs['mii-editor'].redo();
    },
    togglePreview: function() {
      this.$parent.$refs['mii-editor'].togglePreview();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/style/common/variables';

.toolbar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 3.125rem;
  background: $color200;
  text-align: center;
}

.md-button {
  display: block;
  margin: 0 auto;

  &.off .md-icon {
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
