import { basicSetup, EditorView } from 'codemirror';
import { keymap } from '@codemirror/view';
import { redo, redoDepth, undo, undoDepth } from '@codemirror/commands';
import store from '../store';

export default class Editor {
  constructor(element) {
    this.element = element;
    this.parent = element.parentNode;
    this.cleanValue = element.value || '';
    this.handlers = {
      change: [],
      changes: [],
      paste: [],
      blur: [],
    };
    this.customKeymap = keymap.of([
      {
        key: 'Mod-b',
        run: (view) => this.toggleSelectionWrap(view, '**'),
      },
      {
        key: 'Mod-i',
        run: (view) => this.toggleSelectionWrap(view, '_'),
      },
      {
        key: 'Shift-@',
        run: (view) => this.toggleSelectionWrap(view, '`'),
      },
    ]);
    this.cm = this.createCompatApi();
    this.element.style.display = 'none';
    this.createView(this.cleanValue);
  }

  getCmInstance() {
    return this.cm;
  }

  initFilePath(path) {
    store.dispatch('initFilePath', path);
  }

  setValue(value) {
    const docLength = this.view.state.doc.length;
    this.view.dispatch({
      changes: { from: 0, to: docLength, insert: value },
    });
    this.cm.save();
  }

  clean() {
    this.setValue('');
    this.initFilePath('');
    this.clearHistory();
  }

  isClean() {
    return this.cm.isClean();
  }

  isUnsaveFile() {
    return store.state.Editor.filePath;
  }

  updateHistory() {
    const { undo, redo } = this.cm.historySize();
    store.dispatch('setCanUndo', undo > 0);
    store.dispatch('setCanRedo', redo > 0);
  }

  clearHistory() {
    this.cm.markClean();
    this.createView(this.cm.getValue());
    store.dispatch('setCanUndo', false);
    store.dispatch('setCanRedo', false);
  }

  insertTextToEditor(text, line, ch) {
    if (!text) return;
    this.cm.replaceRange(text, { line, ch }, { line, ch });
  }

  createView(doc) {
    if (this.view) {
      this.view.destroy();
    }

    this.view = new EditorView({
      doc,
      extensions: [
        basicSetup,
        this.customKeymap,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          this.handlers.change.forEach((handler) => handler(this.cm));
          this.handlers.changes.forEach((handler) => handler(this.cm));
        }),
        EditorView.domEventHandlers({
          paste: (event) => {
            this.handlers.paste.forEach((handler) => handler(this.cm, event));
          },
          blur: () => {
            this.handlers.blur.forEach((handler) => handler(this.cm));
          },
        }),
      ],
      parent: this.parent,
    });
  }

  createCompatApi() {
    return {
      on: (name, handler) => {
        if (this.handlers[name]) {
          this.handlers[name].push(handler);
        }
      },
      getValue: () => this.view.state.doc.toString(),
      setValue: (value) => this.setValue(value),
      save: () => {
        this.element.value = this.view.state.doc.toString();
      },
      isClean: () => this.view.state.doc.toString() === this.cleanValue,
      markClean: () => {
        this.cleanValue = this.view.state.doc.toString();
      },
      clearHistory: () => this.createView(this.view.state.doc.toString()),
      historySize: () => ({
        undo: undoDepth(this.view.state),
        redo: redoDepth(this.view.state),
      }),
      undo: () => {
        undo(this.view);
        this.updateHistory();
      },
      redo: () => {
        redo(this.view);
        this.updateHistory();
      },
      getCursor: () => {
        const pos = this.view.state.selection.main.head;
        const line = this.view.state.doc.lineAt(pos);
        return { line: line.number - 1, ch: pos - line.from };
      },
      replaceRange: (text, from, to) => {
        const fromPos = this.positionFromLineCh(from);
        const toPos = this.positionFromLineCh(to);
        this.view.dispatch({
          changes: { from: fromPos, to: toPos, insert: text },
        });
      },
    };
  }

  positionFromLineCh({ line, ch }) {
    const lineInfo = this.view.state.doc.line(line + 1);
    return lineInfo.from + ch;
  }

  toggleSelectionWrap(view, marker) {
    const selection = view.state.selection.main;
    const value = view.state.sliceDoc(selection.from, selection.to);
    const wrapped = value.startsWith(marker) && value.endsWith(marker);
    const insert = wrapped ? value.slice(marker.length, -marker.length) : `${marker}${value}${marker}`;
    const selectionOffset = wrapped ? 0 : marker.length;

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert,
      },
      selection: {
        anchor: selection.from + selectionOffset,
        head: selection.from + insert.length - selectionOffset,
      },
    });

    return true;
  }
}
