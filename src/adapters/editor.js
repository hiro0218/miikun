import { minimalSetup, EditorView } from 'codemirror';
import { keymap } from '@codemirror/view';
import { redo, redoDepth, undo, undoDepth } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
// Colors come from the CSS custom properties in Generic/_tokens.scss,
// so the editor follows the OS light/dark scheme without a separate theme.
const markdownHighlight = HighlightStyle.define([
  { tag: tags.heading1, fontSize: '1.75em', fontWeight: '600' },
  { tag: tags.heading2, fontSize: '1.5em', fontWeight: '600' },
  { tag: tags.heading3, fontSize: '1.25em', fontWeight: '600' },
  { tag: tags.heading4, fontSize: '1.1em', fontWeight: '600' },
  { tag: tags.heading5, fontWeight: '600' },
  { tag: tags.heading6, fontWeight: '600', color: 'var(--text-muted)' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.monospace, fontFamily: 'var(--font-mono)' },
  { tag: [tags.link, tags.url], color: 'var(--text-muted)', textDecoration: 'underline' },
  { tag: tags.quote, color: 'var(--text-muted)' },
  { tag: [tags.processingInstruction, tags.meta, tags.labelName, tags.contentSeparator], color: 'var(--text-muted)' },
]);

export default class Editor {
  constructor(element) {
    this.element = element;
    this.parent = element.parentNode;
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
    this.createView(element.value || '');
    this.cleanValue = this.view.state.doc;
  }

  getCmInstance() {
    return this.cm;
  }

  setValue(value) {
    const docLength = this.view.state.doc.length;
    this.view.dispatch({
      changes: { from: 0, to: docLength, insert: value },
    });
    this.cm.save();
  }

  captureDoc() {
    return { state: this.view.state, cleanValue: this.cleanValue, scroll: this.view.scrollSnapshot() };
  }

  restoreDoc(snapshot) {
    this.view.setState(snapshot.state);
    this.cleanValue = snapshot.cleanValue;
    if (snapshot.scroll) {
      this.view.dispatch({ effects: snapshot.scroll });
    }
  }

  openFresh(content = '') {
    this.createView(content);
    this.cleanValue = this.view.state.doc;
    this.cm.save();
  }

  focus() {
    this.view.focus();
  }

  isClean() {
    return this.cm.isClean();
  }

  clearHistory() {
    this.cm.markClean();
    this.createView(this.cm.getValue());
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
        minimalSetup,
        this.customKeymap,
        markdown({ base: markdownLanguage }),
        syntaxHighlighting(markdownHighlight),
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
      // cleanValue holds a CM6 Text; Text.eq compares ropes without flattening the document.
      isClean: () => this.view.state.doc.eq(this.cleanValue),
      markClean: () => {
        this.cleanValue = this.view.state.doc;
      },
      clearHistory: () => this.createView(this.view.state.doc.toString()),
      historySize: () => ({
        undo: undoDepth(this.view.state),
        redo: redoDepth(this.view.state),
      }),
      undo: () => {
        undo(this.view);
      },
      redo: () => {
        redo(this.view);
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
