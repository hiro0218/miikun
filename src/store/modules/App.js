const state = {
  isAlwaysOnTop: false,
};

const mutations = {
  SET_ALWAYS_ON_TOP(state, bool) {
    state.isAlwaysOnTop = bool;
  },
};

const actions = {
  updateAlwaysOnTop({ commit }, bool) {
    commit('SET_ALWAYS_ON_TOP', bool);
  },
};

const getters = {
  isAlwaysOnTop: (state) => state.isAlwaysOnTop,
};

export default {
  state,
  mutations,
  actions,
  getters,
};
