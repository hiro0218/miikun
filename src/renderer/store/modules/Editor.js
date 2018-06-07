const state = {
  filePath: '',
  isPreview: true,
  canUndo: false,
  canRedo: false,
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
  SET_CAN_UNDO(state, bool) {
    state.canUndo = bool;
  },
  SET_CAN_REDO(state, bool) {
    state.canRedo = bool;
  },
};

const actions = {
  updateFilePath({ commit }, path) {
    commit('SET_FILEPATH', path);
  },
  updateIsPreview({ commit }, bool) {
    commit('UPDATE_ISPREVIEW', bool);
  },
  setCanUndo({ commit }, bool) {
    commit('SET_CAN_UNDO', bool);
  },
  setCanRedo({ commit }, bool) {
    commit('SET_CAN_REDO', bool);
  },
};

export default {
  state,
  mutations,
  actions,
};
