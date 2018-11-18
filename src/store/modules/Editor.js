const state = {
  filePath: '',
  isPreview: true,
  openToolbar: true,
  canUndo: false,
  canRedo: false,
  crypt: {
    enable: false,
    key: null,
    op: {
      name: null,
      path: null,
    },
  },
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
  TOGGLE_TOOLBAR(state) {
    state.openToolbar = !state.openToolbar;
  },
  SET_CAN_UNDO(state, bool) {
    state.canUndo = bool;
  },
  SET_CAN_REDO(state, bool) {
    state.canRedo = bool;
  },
  SET_CRYPT_ENABLE(state, bool) {
    state.crypt.enable = bool;
  },
  SET_CRYPT_KEY(state, key) {
    state.crypt.key = key;
  },
  SET_CRYPT_OP(state, obj) {
    state.crypt.op.name = obj.name;
    state.crypt.op.path = obj.path;
  },
};

const actions = {
  updateFilePath({ commit }, path) {
    commit('SET_FILEPATH', path);
  },
  updateIsPreview({ commit }, bool) {
    commit('UPDATE_ISPREVIEW', bool);
  },
  toggleToolbar({ commit }) {
    commit('TOGGLE_TOOLBAR');
  },
  setCanUndo({ commit }, bool) {
    commit('SET_CAN_UNDO', bool);
  },
  setCanRedo({ commit }, bool) {
    commit('SET_CAN_REDO', bool);
  },
  setCryptEnable({ commit }, bool) {
    commit('SET_CRYPT_ENABLE', bool);
  },
  setCryptKey({ commit }, key) {
    commit('SET_CRYPT_KEY', key);
  },
  setCryptOP({ commit }, obj) {
    commit('SET_CRYPT_OP', obj);
  },
};

export default {
  state,
  mutations,
  actions,
};
