// import { remote } from 'electron';
// const { shell } = remote;

import store from '../store';
import AppMenu from '@/service/app-menu';

import { EventBus } from '@/lib/event-bus';

const AppMenuController = {
  undo() {
    EventBus.$emit('undo');
  },
  redo() {
    EventBus.$emit('redo');
  },
  togglePreview() {
    AppMenu.checkedMenuItem('toggle_preview_panel', !this.isOpenPreview());
    store.dispatch('updateIsPreview', !this.isOpenPreview());
  },
  toggleToolbar() {
    AppMenu.checkedMenuItem('toggle_toolbar', !this.isOpenToolbar());
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
