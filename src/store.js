import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import modules from './store/modules';

export default createStore({
  modules,
  plugins: [
    createPersistedState({
      key: 'miikun',
      paths: ['App.isAlwaysOnTop', 'Editor.isPreview', 'Editor.openToolbar'],
    }),
  ],
});
