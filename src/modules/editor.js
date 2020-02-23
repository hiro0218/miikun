import CodeMirror from 'codemirror';
import store from '../store';

export default class Editor {
  constructor(element) {
    const controlKey = process.platform === 'win32' ? 'Ctrl' : 'Cmd';

    this.option = {
      mode: {
        name: 'markdown',
        highlightFormatting: true,
      },
      theme: 'markdown',
      autofocus: true,
      autoCloseTags: true,
      showCursorWhenSelecting: true,
      inputStyle: 'textarea',
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      tabSize: 2,
      indentUnit: 4,
      electricChars: true,
      styleActiveLine: true,
      matchBrackets: true,
      dragDrop: false,
      autoCloseBrackets: true,
      autoRefresh: true,
      extraKeys: {
        Enter: 'newlineAndIndentContinueMarkdownList',
        // **bold**
        [`${controlKey}-B`]: function(cm) {
          const s = cm.getSelection();
          const t = s.slice(0, 2) === '**' && s.slice(-2) === '**';
          cm.replaceSelection(t ? s.slice(2, -2) : '**' + s + '**', 'around');
        },
        // _italic_
        [`${controlKey}-I`]: function(cm) {
          const s = cm.getSelection();
          const t = s.slice(0, 1) === '_' && s.slice(-1) === '_';
          cm.replaceSelection(t ? s.slice(1, -1) : '_' + s + '_', 'around');
        },
        // `code`
        'Shift-@': function(cm) {
          const s = cm.getSelection();
          const t = s.slice(0, 1) === '`' && s.slice(-1) === '`';
          cm.replaceSelection(t ? s.slice(1, -1) : '`' + s + '`', 'around');
        },
      },
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      styleSelectedText: true,
      // highlightSelectionMatches: {
      // showToken: /\w/, annotateScrollbar: true
      // },
    };

    this.cm = CodeMirror.fromTextArea(element, this.option);
  }

  getCmInstance() {
    return this.cm;
  }

  initFilePath(path) {
    store.dispatch('initFilePath', path);
  }

  setValue(value) {
    this.cm.setValue(value);
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
    this.cm.clearHistory();
  }

  insertTextToEditor(text, line, ch) {
    if (!text) return;
    this.cm.replaceRange(text, { line, ch }, { line, ch });
  }
}
