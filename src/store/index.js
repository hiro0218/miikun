import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import modules from './modules';

export default createStore({
  modules,
  plugins: [
    createPersistedState({
      key: 'miikun',
      paths: ['App.isAlwaysOnTop', 'App.theme', 'Editor.isPreview', 'Editor.openToolbar'],
    }),
  ],
});
