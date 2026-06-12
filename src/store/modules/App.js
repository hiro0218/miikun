const state = {
  isAlwaysOnTop: false,
  theme: 'system',
};

const mutations = {
  SET_ALWAYS_ON_TOP(state, bool) {
    state.isAlwaysOnTop = bool;
  },
  SET_THEME(state, theme) {
    state.theme = theme;
  },
};

const actions = {
  updateAlwaysOnTop({ commit }, bool) {
    commit('SET_ALWAYS_ON_TOP', bool);
  },
  updateTheme({ commit }, theme) {
    commit('SET_THEME', theme);
  },
};

const getters = {
  isAlwaysOnTop: (state) => state.isAlwaysOnTop,
  theme: (state) => state.theme,
};

export default {
  state,
  mutations,
  actions,
  getters,
};
