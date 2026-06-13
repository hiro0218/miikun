<template>
  <div class="tabbar">
    <div :class="{ 'fade-left': canScrollLeft, 'fade-right': canScrollRight }" class="tabbar-scroll">
      <div ref="scroller" class="tabbar-tabs" role="tablist" @scroll="updateOverflow" @wheel="onWheel">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          :ref="tab.id === activeTabId ? 'activeTab' : undefined"
          :aria-label="ariaLabelFor(tab)"
          :aria-selected="tab.id === activeTabId"
          :class="{ active: tab.id === activeTabId, dirty: tab.isDirty, dragging: tab.id === draggingTabId }"
          :title="titleFor(tab)"
          class="tab"
          role="tab"
          draggable="true"
          :tabindex="tab.id === activeTabId ? 0 : -1"
          @click="$emit('select', tab.id)"
          @auxclick.middle.prevent="$emit('close', tab.id)"
          @dragstart="onDragStart($event, tab)"
          @dragover.prevent="onDragOver($event, tab)"
          @drop.prevent="onDragEnd"
          @dragend="onDragEnd"
          @keydown.enter.prevent="$emit('select', tab.id)"
          @keydown.space.prevent="$emit('select', tab.id)"
          @keydown.left.prevent="selectAdjacentTab(-1)"
          @keydown.right.prevent="selectAdjacentTab(1)"
          @keydown.home.prevent="selectEdgeTab(0)"
          @keydown.end.prevent="selectEdgeTab(tabs.length - 1)"
        >
          <span class="tab-label">{{ labelFor(tab) }}</span>
          <span v-if="tab.isDirty" class="dirty-dot" aria-hidden="true" />
          <button type="button" class="close-btn" :aria-label="closeLabelFor(tab)" @click.stop="$emit('close', tab.id)">
            <font-awesome-icon icon="xmark" />
          </button>
        </div>
      </div>
    </div>
    <button type="button" class="new-tab-btn" aria-label="New tab" @click="$emit('new-tab')">
      <font-awesome-icon icon="plus" />
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MiiTabBar',
  emits: ['select', 'close', 'new-tab', 'reorder'],
  data() {
    return {
      draggingTabId: null,
      canScrollLeft: false,
      canScrollRight: false,
    };
  },
  computed: {
    ...mapState({
      tabs: (state) => state.Editor.tabs,
      activeTabId: (state) => state.Editor.activeTabId,
    }),
  },
  watch: {
    activeTabId() {
      this.$nextTick(() => {
        const activeTab = this.activeTabElement();
        activeTab?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
        if (this._focusActiveAfterSelect) {
          activeTab?.focus();
          this._focusActiveAfterSelect = false;
        }
      });
    },
    'tabs.length'() {
      this.$nextTick(() => {
        this.updateOverflow();
      });
    },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(() => this.updateOverflow());
    this.resizeObserver.observe(this.$refs.scroller);
    this.updateOverflow();
  },
  beforeUnmount() {
    this.resizeObserver.disconnect();
  },
  methods: {
    labelFor(tab) {
      return tab.path ? this.basename(tab.path) : 'Untitled-' + tab.id;
    },
    titleFor(tab) {
      const label = tab.path || this.labelFor(tab);
      return tab.isDirty ? `${label} - Unsaved changes` : label;
    },
    ariaLabelFor(tab) {
      const label = this.labelFor(tab);
      return tab.isDirty ? `${label}, unsaved changes` : label;
    },
    closeLabelFor(tab) {
      const label = this.labelFor(tab);
      return tab.isDirty ? `Close ${label} with unsaved changes` : `Close ${label}`;
    },
    basename(path) {
      return path.split(/[\\/]/).pop() || path;
    },
    activeTabElement() {
      const ref = this.$refs.activeTab;
      return Array.isArray(ref) ? ref[0] : ref;
    },
    selectTabFromKeyboard(tab) {
      if (!tab) return;
      if (tab.id === this.activeTabId) {
        this.activeTabElement()?.focus();
        return;
      }
      this._focusActiveAfterSelect = true;
      this.$emit('select', tab.id);
    },
    selectAdjacentTab(step) {
      if (this.tabs.length < 2) return;
      const index = this.tabs.findIndex((tab) => tab.id === this.activeTabId);
      if (index === -1) return;
      this.selectTabFromKeyboard(this.tabs[(index + step + this.tabs.length) % this.tabs.length]);
    },
    selectEdgeTab(index) {
      this.selectTabFromKeyboard(this.tabs[index]);
    },
    updateOverflow() {
      const el = this.$refs.scroller;
      if (!el) return;
      this.canScrollLeft = el.scrollLeft > 0;
      this.canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    },
    onWheel(e) {
      const el = this.$refs.scroller;
      if (!el || el.scrollWidth <= el.clientWidth) return;
      // Trackpad horizontal gestures (deltaX) scroll natively; map vertical wheel to horizontal.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    },
    onDragStart(e, tab) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/x-miikun-tab', String(tab.id));
      this.draggingTabId = tab.id;
    },
    onDragOver(e, tab) {
      if (this.draggingTabId == null || this.draggingTabId === tab.id) return;
      e.dataTransfer.dropEffect = 'move';
      const rect = e.currentTarget.getBoundingClientRect();
      const after = e.clientX > rect.left + rect.width / 2;
      // dragover fires continuously; only emit when the insertion point moves.
      if (this._lastDropTarget?.id === tab.id && this._lastDropTarget?.after === after) return;
      this._lastDropTarget = { id: tab.id, after };
      this.$emit('reorder', { id: this.draggingTabId, targetId: tab.id, after });
    },
    onDragEnd() {
      this.draggingTabId = null;
      this._lastDropTarget = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.tabbar {
  display: flex;
  flex-shrink: 0;
  align-items: stretch;
  height: $tabbar-height;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.tabbar-scroll {
  display: flex;
  position: relative;
  min-width: 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    width: 1.25rem;
    transition: opacity 0.15s ease-out;
    opacity: 0;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, var(--bg-secondary), transparent);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, var(--bg-secondary), transparent);
  }

  &.fade-left::before {
    opacity: 1;
  }

  &.fade-right::after {
    opacity: 1;
  }
}

.tabbar-tabs {
  display: flex;
  flex: 1;
  align-items: stretch;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.25rem 0 0.75rem;
  cursor: pointer;
  border-right: 1px solid var(--border);
  color: var(--text-muted);
  transition:
    background-color 0.15s ease-out,
    color 0.15s ease-out;

  &:hover {
    background: var(--code-bg);
    color: var(--text);
  }

  &:focus-visible {
    outline: none;
    box-shadow: inset var(--focus-ring);
  }

  &.active {
    background: var(--bg);
    color: var(--text);
  }

  &.dirty .tab-label {
    font-weight: 600;
  }

  &.dragging {
    opacity: 0.5;
  }
}

.tab-label {
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
}

.dirty-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--text-muted);
  transition: opacity 0.15s ease-out;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 6px;
  color: var(--text-muted);
  transition:
    background-color 0.15s ease-out,
    color 0.15s ease-out;

  &:hover {
    background: var(--border);
    color: var(--text);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .svg-inline--fa {
    font-size: 10px;
  }
}

.new-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.5rem;
  color: var(--text-muted);
  transition:
    background-color 0.15s ease-out,
    color 0.15s ease-out;

  &:hover {
    background: var(--code-bg);
    color: var(--text);
  }

  &:focus-visible {
    outline: none;
    box-shadow: inset var(--focus-ring);
  }

  .svg-inline--fa {
    font-size: 11px;
  }
}
</style>
