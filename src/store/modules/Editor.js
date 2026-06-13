const state = {
  code: '',
  isPreview: false,
  openToolbar: true,
  canUndo: false,
  canRedo: false,
  canPreview: false,
  tabs: [],
  activeTabId: null,
  crypt: {
    enable: false,
    key: null,
    op: {
      name: null,
      path: null,
      tabId: null,
    },
  },
};

const findTab = (state, id) => state.tabs.find((t) => t.id === id);

const getters = {
  filePath: (state) => findTab(state, state.activeTabId)?.path ?? '',
};

const mutations = {
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
  SET_CAN_PREVIEW(state, bool) {
    state.canPreview = bool;
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
    state.crypt.op.tabId = obj.tabId ?? null;
  },
  ADD_TAB(state, { id, path }) {
    state.tabs.push({ id, path: path || '', isDirty: false });
    state.activeTabId = id;
  },
  REMOVE_TAB(state, id) {
    state.tabs = state.tabs.filter((t) => t.id !== id);
    if (state.activeTabId === id) {
      state.activeTabId = state.tabs[0]?.id ?? null;
    }
  },
  SET_ACTIVE_TAB(state, id) {
    if (!findTab(state, id)) return;
    state.activeTabId = id;
  },
  SET_TAB_PATH(state, { id, path }) {
    const tab = findTab(state, id);
    if (tab) tab.path = path;
  },
  SET_TAB_DIRTY(state, { id, isDirty }) {
    const tab = findTab(state, id);
    if (tab) tab.isDirty = isDirty;
  },
  MOVE_TAB(state, { id, targetId, after }) {
    const fromIndex = state.tabs.findIndex((t) => t.id === id);
    const targetIndex = state.tabs.findIndex((t) => t.id === targetId);
    if (fromIndex === -1 || targetIndex === -1) return;
    let toIndex = after ? targetIndex + 1 : targetIndex;
    if (fromIndex < toIndex) toIndex -= 1;
    if (toIndex === fromIndex) return;
    const tabs = [...state.tabs];
    const [moved] = tabs.splice(fromIndex, 1);
    tabs.splice(toIndex, 0, moved);
    state.tabs = tabs;
  },
};

const actions = {
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
  setCanPreview({ commit }, bool) {
    commit('SET_CAN_PREVIEW', bool);
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
  addTab({ commit }, { id, path }) {
    commit('ADD_TAB', { id, path });
  },
  removeTab({ commit }, id) {
    commit('REMOVE_TAB', id);
  },
  activateTab({ commit }, id) {
    commit('SET_ACTIVE_TAB', id);
  },
  setTabPath({ commit }, { id, path }) {
    commit('SET_TAB_PATH', { id, path });
  },
  setTabDirty({ commit }, { id, isDirty }) {
    commit('SET_TAB_DIRTY', { id, isDirty });
  },
  moveTab({ commit }, { id, targetId, after }) {
    commit('MOVE_TAB', { id, targetId, after });
  },
};

export default {
  state,
  getters,
  mutations,
  actions,
};
