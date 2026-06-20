import { minimalSetup, EditorView } from 'codemirror';
import { Compartment } from '@codemirror/state';
import { keymap, lineNumbers } from '@codemirror/view';
import { redo, redoDepth, undo, undoDepth } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

type EditorHandler = (...args: any[]) => void;
type CompatApi = Record<string, any>;

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
const EDITABLE_HEADING_LEVELS = [0, 1, 2, 3];
const HEADING_MARKER = /^(#{1,6})(?:\s+|$)/;
const BULLET_MARKER = /^(\s*)[-*+]\s+/;

export default class Editor {
  element: HTMLTextAreaElement;
  parent: HTMLElement;
  handlers: Record<string, EditorHandler[]>;
  customKeymap: any;
  lineNumbersCompartment: Compartment;
  showLineNumbers: boolean;
  cm: CompatApi;
  view: EditorView;
  cleanValue: any;

  constructor(element: HTMLTextAreaElement, options: { showLineNumbers?: boolean } = {}) {
    this.element = element;
    this.parent = element.parentNode as HTMLElement;
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
    this.lineNumbersCompartment = new Compartment();
    this.showLineNumbers = options.showLineNumbers === true;
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

  setLineNumbers(showLineNumbers) {
    this.showLineNumbers = showLineNumbers;
    this.view.dispatch({
      effects: this.lineNumbersCompartment.reconfigure(this.getLineNumberExtension()),
    });
  }

  isClean() {
    return this.cm.isClean();
  }

  getDocLength() {
    return this.view.state.doc.length;
  }

  clearHistory() {
    const value = this.cm.getValue();
    const selection = this.view.state.selection;
    const scroll = this.view.scrollSnapshot();
    const wasFocused = this.view.hasFocus;

    this.createView(value);
    this.cleanValue = this.view.state.doc;
    this.view.dispatch({ selection, effects: scroll });
    if (wasFocused) {
      this.view.focus();
    }
  }

  insertTextToEditor(text, line, ch) {
    if (!text) return;
    this.cm.replaceRange(text, { line, ch }, { line, ch });
  }

  setHeadingLevel(level) {
    const headingLevel = Number(level);
    if (!EDITABLE_HEADING_LEVELS.includes(headingLevel)) return false;

    const { doc, selection } = this.view.state;
    const selectedLineEnd = this.getSelectedLineEnd(selection.main, doc);
    const fromLine = doc.lineAt(selection.main.from).number;
    const toLine = doc.lineAt(selectedLineEnd).number;
    const changes = [];

    for (let lineNumber = fromLine; lineNumber <= toLine; lineNumber += 1) {
      const change = this.getHeadingLineChange(doc.line(lineNumber), headingLevel);
      if (change) changes.push(change);
    }

    if (changes.length > 0) {
      this.view.dispatch({ changes });
    }

    this.view.focus();
    return true;
  }

  toggleBold() {
    const applied = this.toggleSelectionWrap(this.view, '**');
    this.view.focus();
    return applied;
  }

  insertLink() {
    const selection = this.view.state.selection.main;
    const selectedText = this.view.state.sliceDoc(selection.from, selection.to);
    const label = selectedText || 'text';
    const insert = `[${label}](url)`;
    const selectionFrom = selectedText ? selection.from + label.length + 3 : selection.from + 1;
    const selectionTo = selectedText ? selectionFrom + 3 : selectionFrom + label.length;

    this.view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert,
      },
      selection: {
        anchor: selectionFrom,
        head: selectionTo,
      },
    });
    this.view.focus();
    return true;
  }

  toggleBulletList() {
    const { doc, selection } = this.view.state;
    const selectedLineEnd = this.getSelectedLineEnd(selection.main, doc);
    const fromLine = doc.lineAt(selection.main.from).number;
    const toLine = doc.lineAt(selectedLineEnd).number;
    const changes = [];

    for (let lineNumber = fromLine; lineNumber <= toLine; lineNumber += 1) {
      changes.push(this.getBulletLineChange(doc.line(lineNumber)));
    }

    this.view.dispatch({ changes });
    this.view.focus();
    return true;
  }

  createView(doc) {
    if (this.view) {
      this.view.destroy();
    }

    this.view = new EditorView({
      doc,
      extensions: [
        minimalSetup,
        this.lineNumbersCompartment.of(this.getLineNumberExtension()),
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

  getLineNumberExtension() {
    return this.showLineNumbers ? lineNumbers() : [];
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
      clearHistory: () => this.clearHistory(),
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
      setHeadingLevel: (level) => this.setHeadingLevel(level),
      toggleBold: () => this.toggleBold(),
      insertLink: () => this.insertLink(),
      toggleBulletList: () => this.toggleBulletList(),
    };
  }

  getSelectedLineEnd(selection, doc) {
    if (selection.to <= selection.from) return selection.to;

    const endsAtLineBreak = doc.sliceString(selection.to - 1, selection.to) === '\n';
    return endsAtLineBreak ? selection.to - 1 : selection.to;
  }

  getHeadingLineChange(line, level) {
    const marker = line.text.match(HEADING_MARKER);
    const currentMarker = marker ? marker[0] : '';
    const nextMarker = level === 0 ? '' : `${'#'.repeat(level)} `;

    if (currentMarker === nextMarker) return null;

    return {
      from: line.from,
      to: line.from + currentMarker.length,
      insert: nextMarker,
    };
  }

  getBulletLineChange(line) {
    const marker = line.text.match(BULLET_MARKER);

    if (marker) {
      const markerFrom = line.from + marker[1].length;
      return {
        from: markerFrom,
        to: line.from + marker[0].length,
        insert: '',
      };
    }

    const indent = line.text.match(/^\s*/)[0];
    return {
      from: line.from + indent.length,
      to: line.from + indent.length,
      insert: '- ',
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
