const state = {
  filePath: '',
  isPreview: true,
};

const mutations = {
  RESET_FILEPATH(state) {
    state.filePath = '';
  },
  SET_FILEPATH(state, path) {
    state.filePath = path;
  },
  UPDATE_ISPREVIEW(state, bool) {
    state.isPreview = bool;
  },
};

const actions = {
  updateFilePath({ commit }, path) {
    commit('SET_FILEPATH', path);
  },
  updateIsPreview({ commit }, bool) {
    commit('UPDATE_ISPREVIEW', bool);
  },
};

export default {
  state,
  mutations,
  actions,
};
