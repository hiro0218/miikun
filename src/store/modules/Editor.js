const state = {
  filePath: '',
  code: '',
  isPreview: false,
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
  temporary: {
    input: '',
  },
};

const mutations = {
  RESET_FILEPATH(state) {
    state.filePath = '';
  },
  SET_FILEPATH(state, path) {
    state.filePath = path;
  },
  UPDATE_CODE(state, payload) {
    state.code = payload;
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
  SET_TEMP_INPUT(state, payload) {
    state.temporary.input = payload;
  },
};

const actions = {
  updateFilePath({ commit }, path) {
    commit('SET_FILEPATH', path);
  },
  updateCode({ commit }, payload) {
    commit('UPDATE_CODE', payload);
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
  initFilePath({ commit }, path) {
    commit('SET_FILEPATH', path);
    commit('SET_CAN_UNDO', false);
    commit('SET_CAN_REDO', false);
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
  setTempInput({ commit }, payload) {
    commit('SET_TEMP_INPUT', payload);
  },
};

export default {
  state,
  mutations,
  actions,
};
