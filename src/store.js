import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

import modules from './store/modules';

Vue.use(Vuex);

export default new Vuex.Store({
  modules,
  plugins: [
    createPersistedState({
      key: 'miikun',
      paths: ['App.isAlwaysOnTop', 'Editor.isPreview', 'Editor.openToolbar', 'Editor.temporary.input'],
    }),
  ],
});
