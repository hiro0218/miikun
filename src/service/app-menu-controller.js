// import { remote } from 'electron';
// const { shell } = remote;

import store from '../store';

const AppMenuController = {
  togglePreview() {
    store.dispatch('updateIsPreview', !store.state.Editor.isPreview);
  },
  toggleToolbar() {
    store.dispatch('toggleToolbar');
  },
};

export default AppMenuController;
