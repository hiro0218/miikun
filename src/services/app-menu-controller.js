import { isWindowAlwaysOnTop, setWindowAlwaysOnTop, setThemeSource } from '@/adapters/electron';

import store from '../store';

import { EventBus } from '@/shared/event-bus';

const AppMenuController = {
  toggleAlwaysOnTop() {
    const isAlwaysOnTop = isWindowAlwaysOnTop();
    setWindowAlwaysOnTop(!isAlwaysOnTop);
    store.dispatch('updateAlwaysOnTop', !isAlwaysOnTop);
  },
  setTheme(theme) {
    // themeSource drives prefers-color-scheme, so the CSS tokens follow automatically.
    setThemeSource(theme);
    store.dispatch('updateTheme', theme);
  },
  undo() {
    EventBus.$emit('undo');
  },
  redo() {
    EventBus.$emit('redo');
  },
  newFile() {
    EventBus.$emit('newFile');
  },
  openFile() {
    EventBus.$emit('openFile');
  },
  saveFile() {
    EventBus.$emit('saveFile');
  },
  saveAs() {
    EventBus.$emit('saveAs');
  },
  closeTab() {
    EventBus.$emit('closeTab');
  },
  nextTab() {
    EventBus.$emit('nextTab');
  },
  prevTab() {
    EventBus.$emit('prevTab');
  },
  togglePreview() {
    store.dispatch('updateIsPreview', !this.isOpenPreview());
  },
  toggleToolbar() {
    store.dispatch('toggleToolbar');
  },
  isOpenPreview() {
    return store.state.Editor.isPreview;
  },
  isOpenToolbar() {
    return store.state.Editor.openToolbar;
  },
};

export default AppMenuController;
