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
    AppMenu.checkedMenuItem('toggle_preview_panel', !store.state.Editor.isPreview);
    store.dispatch('updateIsPreview', !store.state.Editor.isPreview);
  },
  toggleToolbar() {
    AppMenu.checkedMenuItem('toggle_toolbar', !store.state.Editor.openToolbar);
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
