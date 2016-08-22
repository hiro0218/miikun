<style scoped>
</style>

<template>
  <div class='container' v-bind:class="{open:!isPreview}">
    <div class='input'><textarea id='editor' v-el:codemirror v-model='input' debounce='500'></textarea></div>
    <div class='preview' v-if="isPreview == true"><div class='markdown-body' v-html='input | markdown'></div></div>
  </div>
  <div class='dropzone'></div>
</template>

<script>
var shell = require('electron').shell

import CodeMirror from 'codemirror/lib/codemirror'
require('codemirror/mode/gfm/gfm.js')
require('codemirror/mode/markdown/markdown.js')
require('codemirror/mode/xml/xml.js')
require('codemirror/addon/edit/closetag.js')
require('codemirror/addon/edit/continuelist.js')
require('codemirror/addon/edit/closebrackets.js')
require('codemirror/addon/lint/lint.js')
require('codemirror/addon/mode/overlay.js')
require('codemirror/addon/selection/active-line.js')
require('codemirror/addon/fold/foldcode.js')
require('codemirror/addon/fold/foldgutter.js')
require('codemirror/addon/fold/brace-fold.js')
require('codemirror/addon/fold/xml-fold.js')
require('codemirror/addon/fold/markdown-fold.js')
require('codemirror/addon/fold/comment-fold.js')

import Countable from 'countable'
import MarkdownIt from 'markdown-it'
import MarkdownItCheckbox from 'markdown-it-checkbox'
import MarkdownItFootnote from 'markdown-it-footnote'

import Prism from 'prismjs'
require('prismjs/plugins/remove-initial-line-feed/prism-remove-initial-line-feed.min.js')

let md = new MarkdownIt({
  html: true,
  xhtmlOut: false,
  breaks: true,
  langPrefix: 'language-',
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang) {
      const language = (!lang || lang === 'html') ? 'markup' : lang
      try {
        if (!Prism.languages[language]) {
          require(`prismjs/components/prism-${language}.min.js`)
        }
        if (!Prism.languages[language]) {
          return ''
        } else {
          return Prism.highlight(str, Prism.languages[language])
        }
      } catch (__) {}
    }
    return ''
  }
})

md.use(MarkdownItCheckbox, {
  idPrefix: 'checkbox_'
}).use(MarkdownItFootnote)

export default {
  name: 'mii-editor',
  data () {
    return {
      isPreview: false,
      input: '',
      path: ''
    }
  },
  ready () {
    const self = this
    this.editor = CodeMirror.fromTextArea(this.$els.codemirror, {
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
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    })

    this.editor.markClean()

    this.editor.on('change', function (e) {
      self.editor.save()
      self.editor.getTextArea().dispatchEvent(new Event('change'))
      self.updateButtonStatus()
    })

    this.openLinkExternal()

    var dragDrop = require('../modules/dragdrop.js')
    dragDrop.init()
    dragDrop.openFile = self.$root.$children[0].$refs.miiToolbar.readFile
  },
  methods: {
    updateButtonStatus () {
      this.$root.$children[0].$refs.miiToolbar.canUndo = this.canUndo()
      this.$root.$children[0].$refs.miiToolbar.canRedo = this.canRedo()
      this.$root.$children[0].$refs.miiToolbar.canSave = !this.editor.isClean()
    },
    updateStatusBar () {
      var self = this
      Countable.live(this.$els.codemirror, function (counter) {
        self.$root.$children[0].$refs.miiStatusbar.words = counter.words
        self.$root.$children[0].$refs.miiStatusbar.characters = counter.characters
      })
      this.$root.$children[0].$refs.miiStatusbar.lines = this.editor.lineCount()
      var pos = this.editor.getCursor()
      this.$root.$children[0].$refs.miiStatusbar.cursor = (pos.line + ':' + pos.ch)
    },
    setPath (value) {
      this.path = value
    },
    setEditor (value) {
      this.editor.setValue(value)
      this.editor.save()
    },
    undo () {
      this.editor.undo()
    },
    redo () {
      this.editor.redo()
    },
    canUndo () {
      return this.editor.historySize().undo > 0
    },
    canRedo () {
      return this.editor.historySize().redo > 0
    },
    isClean () {
      return this.editor.isClean()
    },
    clean () {
      this.setEditor('')
      this.setPath('')
      this.editor.markClean()
      this.editor.clearHistory()
      this.updateButtonStatus()
    },
    openLinkExternal () {
      document.addEventListener('click', function (e) {
        if (e.target.tagName.toLowerCase() !== 'a') {
          return
        }

        if (e.target.getAttribute('href') && e.target.getAttribute('href').substring(0, 4) === 'http') {
          e.preventDefault()
          e.stopPropagation()
          shell.openExternal(e.target.href)
        }
      })
    }
  },
  watch: {
    input: function (val, oldVal) {
      this.updateStatusBar()
    },
    path: function (val) {
      this.$root.$children[0].$refs.miiStatusbar.path = val
    }
  },
  filters: {
    markdown: function () {
      return md.render(this.input)
    }
  }
}
</script>
