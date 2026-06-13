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

Browser-only `npm run serve` / `npm run build` scripts are intentionally not defined; the renderer imports Node builtins (`fs`, `crypto`) directly, so the app only truly runs under Electron.

## Architecture

Vue CLI 5 + vue-cli-plugin-electron-builder (webpack). Two entry points:

- `src/background.js` — Electron main process (window creation only, almost no logic)
- `src/main.js` — Vue 3 renderer app

### Layered src/ layout (library-swap friendly)

Each third-party library is imported by exactly one adapter module; the rest of the app depends on the adapter's app-facing API. Dependency direction: `components → services → adapters → libraries`. `shared/` and `store/` may be used from any layer, **except adapters must never import the store** — callers pass state in. The boundaries are machine-enforced via `no-restricted-imports` in `.eslintrc.js` (per-directory `overrides`).

- `src/adapters/` — one file per external dependency surface: `editor.js` (CodeMirror 6), `markdown.js` (markdown-it + shiki), `filesystem.js` (Node `fs`), `encryptor.js` (Node `crypto`), `electron.js` (`electron` + `@electron/remote`: dialogs, menu build/checkbox state, shell, window, nativeTheme, webUtils)
- `src/services/` — application logic: `active-document.js` (content/path/clean-history state transitions), `file-operation.js` (open/save orchestration), `render-pipeline.js` (async preview render sequencing), `editor-commands.js` (EventBus command binding), `app-menu.js` (menu template + setup + checkbox sync), `app-menu-controller.js` (EventBus/store dispatch only), `link-title.js` (paste-URL title fetch)
- `src/shared/` — pure utilities with no internal deps: `event-bus.js`, `errors.js`, `url.js`
- `src/store/` — the single Vuex store (`index.js`) + auto-registered `modules/`

Swapping a library means rewriting one adapter file while keeping its exported API (CodeMirror→another editor in `adapters/editor.js`, markdown-it→another renderer in `adapters/markdown.js`, `@electron/remote`→IPC in `adapters/electron.js`).

### Renderer has full Node/Electron access (no IPC)

`nodeIntegration: true`, `contextIsolation: false`, and `@electron/remote` mean all real logic lives in the renderer: file I/O (`src/adapters/filesystem.js` imports `fs`), crypto (`src/adapters/encryptor.js` imports `crypto`), native menus/dialogs (`src/adapters/electron.js`). The webpack target is `electron-renderer` with Node builtins declared as externals (`vue.config.js`). There is no preload script and no ipcMain/ipcRenderer traffic — keep new native-API code inside `src/adapters/`.

### Command flow: native menu → EventBus → Editor.vue

File operations and native menu Undo/Redo are triggered from the native app menu, not from Vue components:

`src/services/app-menu.js` (menu template + accelerators) → `src/services/app-menu-controller.js` → `EventBus.$emit(...)` (`src/shared/event-bus.js`, EventTarget-based) → `src/services/editor-commands.js` bindings → handlers in `src/components/Editor.vue` (`newFile` / `openFile` / `saveFile` / `saveAs` / `undo` / `redo`).

UI state (preview/toolbar toggles, always-on-top, undo/redo availability) flows through Vuex instead of the EventBus; menu checkbox state follows the store via `store.subscribe` in `services/app-menu.js` — controllers never reach back into the menu.

### Editor: CodeMirror 6 behind a CM5-style compat layer

`src/adapters/editor.js` wraps CodeMirror 6 but exposes the old CodeMirror 5 API shape through `createCompatApi()`. Components interact via `this.editor.cm` (`on('change')`, `getValue()`, `replaceRange(text, {line, ch})`, `historySize()`, ...). Extend the compat object rather than handing the CM6 `EditorView` to components. The adapter is store-free: `Editor.vue` reads `historySize()` in its `changes` handler to dispatch `setCanUndo`/`setCanRedo`; `src/services/active-document.js` handles file path and clean-history transitions after open/save/new document actions. Custom keymap: Mod-b (bold), Mod-i (italic), Shift-@ (inline code). Dirty tracking compares against `cleanValue` (`isClean`/`markClean`); `clearHistory()` recreates the entire EditorView.

### Encrypted .mii files

A `.mii` extension switches the `Filesystem` singleton (`src/adapters/filesystem.js`) into encrypt mode: binary layout `| base info 16B | HMAC 32B | IV 16B | ciphertext |`, AES-256-CBC with the key derived via HMAC-SHA256 (`src/adapters/encryptor.js`). `readFile(path, cb, key)` and `writeFile(path, content, cb, key)` take the key from the caller — because the password prompt (`KeyPrompt.vue`) is async, the pending operation is stored in Vuex as `Editor.crypt.op = { name: 'open'|'save', path }` and resumed in `Editor.vue#onKeyPromptDone`, which passes the entered key to `src/services/file-operation.js`. The last successful key is cached on the Filesystem instance so existing encrypted saves can reuse it; if an existing encrypted save has no cached key, `Editor.vue` reopens the key prompt before writing.

### State: single Vuex store

`src/store/index.js` is the only store definition, with `vuex-persistedstate` persisting `App.isAlwaysOnTop`, `App.theme`, `Editor.isPreview`, `Editor.openToolbar` under the localStorage key `miikun`. Modules are auto-registered from `src/store/modules/*.js` via `require.context` (`store/modules/index.js`) without namespacing — action names are global.

### Markdown preview

`src/adapters/markdown.js`: markdown-it (+ checkbox, footnote, anchor, multimd-table, deflist plugins) with shiki highlighting (github-light/github-dark dual themes switched by `prefers-color-scheme`; block background pinned to `--code-bg` in `Vendor/_shiki.scss`). `render()` is async: it scans fenced code blocks and `loadLanguage`s any missing grammars before the synchronous markdown-it pass, so the first paint is already highlighted. `src/services/render-pipeline.js` owns the sequence guard that drops stale async render results; `Editor.vue` requests rendering and publishes the resulting preview HTML with `v-html` only while the preview pane is open.

### Editor boundary map

For editor/file/preview/command ownership, start with `docs/architecture/editor-boundaries.md`.

### Styling

ITCSS-layered SCSS under `src/assets/style/` (Settings → Tools → Generic → Elements → Objects → Components → Trumps → Vendor), composed with `@use`/`@forward` (Sass modules — `@import` is banned as deprecated). `Settings/_variables.scss` is injected into every SCSS compilation as `@use ... as *` via `additionalData` in `vue.config.js`, so variables like `$toolbar-width` are usable inside component `<style lang="scss">` blocks without explicit imports; partials that need variables declare their own `@use '../Settings/variables' as *`.

## Conventions

- `@` aliases `src/` (vue.config.js).
- Prettier: 120-char width, single quotes, trailing commas. ESLint extends `plugin:vue/recommended` + prettier; notable rules: `max-depth: 3`, `prefer-const`.
- lint-staged is configured to run `vue-cli-service lint` on staged `*.{js,vue}` files.
