import { useEffect, useReducer } from 'react';

const STORAGE_KEY = 'miikun';

const state = {
  App: {
    isAlwaysOnTop: false,
    theme: 'system',
  },
  Editor: {
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
  },
};

const stateListeners = new Set();
const mutationListeners = new Set();

const findTab = (editorState, id) => editorState.tabs.find((t) => t.id === id);

const applyPersistedState = () => {
  try {
    const persisted = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    if (!persisted) return;

    if (persisted.App) {
      state.App.isAlwaysOnTop = persisted.App.isAlwaysOnTop ?? state.App.isAlwaysOnTop;
      state.App.theme = persisted.App.theme ?? state.App.theme;
    }

    if (persisted.Editor) {
      state.Editor.isPreview = persisted.Editor.isPreview ?? state.Editor.isPreview;
      state.Editor.openToolbar = persisted.Editor.openToolbar ?? state.Editor.openToolbar;
    }
  } catch (e) {
    // Ignore invalid legacy persisted state.
  }
};

const persistState = () => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        App: {
          isAlwaysOnTop: state.App.isAlwaysOnTop,
          theme: state.App.theme,
        },
        Editor: {
          isPreview: state.Editor.isPreview,
          openToolbar: state.Editor.openToolbar,
        },
      }),
    );
  } catch (e) {
    // localStorage can be unavailable in restricted runtimes.
  }
};

applyPersistedState();

const getters = {};

Object.defineProperties(getters, {
  filePath: {
    get() {
      return findTab(state.Editor, state.Editor.activeTabId)?.path ?? '';
    },
  },
  isAlwaysOnTop: {
    get() {
      return state.App.isAlwaysOnTop;
    },
  },
  theme: {
    get() {
      return state.App.theme;
    },
  },
});

const mutations = {
  UPDATE_CODE(payload) {
    state.Editor.code = payload;
  },
  UPDATE_ISPREVIEW(bool) {
    state.Editor.isPreview = bool;
  },
  TOGGLE_TOOLBAR() {
    state.Editor.openToolbar = !state.Editor.openToolbar;
  },
  SET_CAN_UNDO(bool) {
    state.Editor.canUndo = bool;
  },
  SET_CAN_REDO(bool) {
    state.Editor.canRedo = bool;
  },
  SET_CAN_PREVIEW(bool) {
    state.Editor.canPreview = bool;
  },
  SET_CRYPT_ENABLE(bool) {
    state.Editor.crypt.enable = bool;
  },
  SET_CRYPT_KEY(key) {
    state.Editor.crypt.key = key;
  },
  SET_CRYPT_OP(obj) {
    state.Editor.crypt.op.name = obj.name;
    state.Editor.crypt.op.path = obj.path;
    state.Editor.crypt.op.tabId = obj.tabId ?? null;
  },
  ADD_TAB({ id, path }) {
    state.Editor.tabs.push({ id, path: path || '', isDirty: false });
    state.Editor.activeTabId = id;
  },
  REMOVE_TAB(id) {
    state.Editor.tabs = state.Editor.tabs.filter((t) => t.id !== id);
    if (state.Editor.activeTabId === id) {
      state.Editor.activeTabId = null;
    }
  },
  SET_ACTIVE_TAB(id) {
    if (!findTab(state.Editor, id)) return;
    state.Editor.activeTabId = id;
  },
  SET_TAB_PATH({ id, path }) {
    const tab = findTab(state.Editor, id);
    if (tab) tab.path = path;
  },
  SET_TAB_DIRTY({ id, isDirty }) {
    const tab = findTab(state.Editor, id);
    if (tab) tab.isDirty = isDirty;
  },
  MOVE_TAB({ id, targetId, after }) {
    const fromIndex = state.Editor.tabs.findIndex((t) => t.id === id);
    const targetIndex = state.Editor.tabs.findIndex((t) => t.id === targetId);
    if (fromIndex === -1 || targetIndex === -1) return;

    let toIndex = after ? targetIndex + 1 : targetIndex;
    if (fromIndex < toIndex) toIndex -= 1;
    if (toIndex === fromIndex) return;

    const tabs = [...state.Editor.tabs];
    const [moved] = tabs.splice(fromIndex, 1);
    tabs.splice(toIndex, 0, moved);
    state.Editor.tabs = tabs;
  },
  SET_ALWAYS_ON_TOP(bool) {
    state.App.isAlwaysOnTop = bool;
  },
  SET_THEME(theme) {
    state.App.theme = theme;
  },
};

const actionTypes = {
  updateCode: 'UPDATE_CODE',
  updateIsPreview: 'UPDATE_ISPREVIEW',
  toggleToolbar: 'TOGGLE_TOOLBAR',
  setCanUndo: 'SET_CAN_UNDO',
  setCanRedo: 'SET_CAN_REDO',
  setCanPreview: 'SET_CAN_PREVIEW',
  setCryptEnable: 'SET_CRYPT_ENABLE',
  setCryptKey: 'SET_CRYPT_KEY',
  setCryptOP: 'SET_CRYPT_OP',
  addTab: 'ADD_TAB',
  removeTab: 'REMOVE_TAB',
  activateTab: 'SET_ACTIVE_TAB',
  setTabPath: 'SET_TAB_PATH',
  setTabDirty: 'SET_TAB_DIRTY',
  moveTab: 'MOVE_TAB',
  updateAlwaysOnTop: 'SET_ALWAYS_ON_TOP',
  updateTheme: 'SET_THEME',
};

const notify = (type, payload) => {
  persistState();
  const mutation = { type, payload };
  mutationListeners.forEach((listener) => listener(mutation, state));
  stateListeners.forEach((listener) => listener());
};

const store = {
  state,
  getters,
  dispatch(action, payload) {
    const type = actionTypes[action];
    if (!type) return Promise.resolve();
    mutations[type](payload);
    notify(type, payload);
    return Promise.resolve();
  },
  subscribe(listener) {
    mutationListeners.add(listener);
    return () => mutationListeners.delete(listener);
  },
  subscribeState(listener) {
    stateListeners.add(listener);
    return () => stateListeners.delete(listener);
  },
};

export const useStore = () => {
  const [, forceUpdate] = useReducer((value) => value + 1, 0);

  useEffect(() => store.subscribeState(forceUpdate), []);

  return store;
};

export default store;
