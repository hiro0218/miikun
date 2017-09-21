'use strict'

require('codemirror/mode/gfm/gfm.js')
require('codemirror/mode/markdown/markdown.js')
require('codemirror/mode/xml/xml.js')
require('codemirror/addon/edit/closetag.js')
require('codemirror/addon/edit/continuelist.js')
require('codemirror/addon/edit/closebrackets.js')
require('codemirror/addon/lint/lint.js')
require('codemirror/addon/mode/overlay.js')
require('codemirror/addon/fold/foldcode.js')
require('codemirror/addon/fold/foldgutter.js')
require('codemirror/addon/fold/brace-fold.js')
require('codemirror/addon/fold/xml-fold.js')
require('codemirror/addon/fold/markdown-fold.js')
require('codemirror/addon/fold/comment-fold.js')
require('codemirror/addon/selection/active-line.js')

export function option () {
  return {
    mode: {
      name: 'markdown',
      highlightFormatting: true
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
    extraKeys: {'Enter': 'newlineAndIndentContinueMarkdownList'},
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    styleSelectedText: true,
    // highlightSelectionMatches: {
    // showToken: /\w/, annotateScrollbar: true
    // },
  }
}
