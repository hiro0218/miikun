# CLAUDE.md

This file provides guidance to LLM when working with code in this repository.

## Project

miikun an Electron + Vue 3 desktop Markdown editor. Edits plain `.md`/`.txt` files plus an encrypted `.mii` format (AES-256-CBC + HMAC).

## Commands

```bash
npm install              # postinstall runs electron-builder install-app-deps
npm run electron:serve   # run the app in development (dev server on port 8888, DevTools auto-open)
npm run electron:build   # production desktop build (mac target: zip)
npm run lint             # ESLint via vue-cli-service — auto-fixes by default
npm run lint:scss        # stylelint check
npm run format:scss      # stylelint --fix
```

There is no test suite. Verification = `npm run lint` + confirming the app still launches via `electron:serve`.

`npm run serve` / `npm run build` exist but target the browser; the renderer imports Node builtins (`fs`, `crypto`) directly, so the app only truly runs under Electron.

## Architecture

Vue CLI 5 + vue-cli-plugin-electron-builder (webpack). Two entry points:

- `src/background.js` — Electron main process (window creation only, almost no logic)
- `src/main.js` — Vue 3 renderer app

### Renderer has full Node/Electron access (no IPC)

`nodeIntegration: true`, `contextIsolation: false`, and `@electron/remote` mean all real logic lives in the renderer: file I/O (`src/modules/Filesystem.js` imports `fs`), crypto (`src/modules/Encryptor.js` imports `crypto`), native menus/dialogs (`@electron/remote`). The webpack target is `electron-renderer` with Node builtins declared as externals (`vue.config.js`). There is no preload script and no ipcMain/ipcRenderer traffic — keep new native-API code in this same pattern.

### Command flow: native menu → EventBus → Editor.vue

File operations are triggered from the native app menu, not from Vue components:

`src/service/app-menu.js` (menu template + accelerators) → `src/service/app-menu-controller.js` → `EventBus.$emit(...)` (`src/lib/event-bus.js`, EventTarget-based) → listeners in `src/components/Editor.vue` (`newFile` / `openFile` / `saveFile` / `saveAs` / `undo` / `redo`) → `src/modules/Filesystem.js` + `src/modules/dialog.js` (synchronous remote dialogs).

UI state (preview/toolbar toggles, always-on-top, undo/redo availability) flows through Vuex instead of the EventBus; menu checkbox state is synced back via `AppMenu.checkedMenuItem()`.

### Editor: CodeMirror 6 behind a CM5-style compat layer

`src/modules/editor.js` wraps CodeMirror 6 but exposes the old CodeMirror 5 API shape through `createCompatApi()`. Components interact via `this.editor.cm` (`on('change')`, `getValue()`, `replaceRange(text, {line, ch})`, `historySize()`, ...). Extend the compat object rather than handing the CM6 `EditorView` to components. Custom keymap: Mod-b (bold), Mod-i (italic), Shift-@ (inline code). Dirty tracking compares against `cleanValue` (`isClean`/`markClean`); `clearHistory()` recreates the entire EditorView.

### Encrypted .mii files

A `.mii` extension switches the `Filesystem` singleton into encrypt mode: binary layout `| base info 16B | HMAC 32B | IV 16B | ciphertext |`, AES-256-CBC with the key derived via HMAC-SHA256 (`Encryptor.js`). Because the password prompt (`KeyPrompt.vue`) is async, the pending operation is stored in Vuex as `Editor.crypt.op = { name: 'open'|'save', path }` and resumed in `Editor.vue#onKeyPromptDone`. The last successful key is cached on the Filesystem instance so plain saves don't re-prompt.

### State: two store files, only one is live

`src/main.js` imports `./store`, which webpack resolves to **`src/store.js`** (file beats directory) — this is the active store, with `vuex-persistedstate` persisting `App.isAlwaysOnTop`, `Editor.isPreview`, `Editor.openToolbar` under the localStorage key `miikun`. `src/store/index.js` is shadowed dead code; editing it has no effect. Modules are auto-registered from `src/store/modules/*.js` via `require.context` (`store/modules/index.js`) without namespacing — action names are global.

### Markdown preview

`src/lib/markdown.js`: markdown-it (+ checkbox, footnote, anchor, multimd-table, deflist plugins) with Prism highlighting that lazy-requires `prismjs/components/prism-<lang>.min.js`. `Editor.vue` renders the output with `v-html`, debounced 200ms, only while the preview pane is open.

### Styling

ITCSS-layered SCSS under `src/assets/style/` (Settings → Tools → Generic → Elements → Objects → Components → Trumps → Vendor). The Settings layer is injected into every SCSS compilation via `additionalData` in `vue.config.js`, so variables like `$toolbar-width` are usable inside component `<style lang="scss">` blocks without explicit imports.

## Conventions

- `@` aliases `src/` (vue.config.js).
- Prettier: 120-char width, single quotes, trailing commas. ESLint extends `plugin:vue/recommended` + prettier; notable rules: `max-depth: 3`, `prefer-const`.
- lint-staged is configured to run `vue-cli-service lint` on staged `*.{js,vue}` files.
