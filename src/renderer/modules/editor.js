'use strict'

import 'codemirror/mode/gfm/gfm.js'
import 'codemirror/mode/markdown/markdown.js'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/addon/edit/closetag.js'
import 'codemirror/addon/edit/continuelist.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/mode/overlay.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/xml-fold.js'
import 'codemirror/addon/fold/markdown-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/selection/active-line.js'

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
