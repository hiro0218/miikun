'use strict'

import MarkdownIt from 'markdown-it'
import MarkdownItCheckbox from 'markdown-it-checkbox'
import MarkdownItFootnote from 'markdown-it-footnote'

import Prism from 'prismjs'
require('prismjs/plugins/remove-initial-line-feed/prism-remove-initial-line-feed.min.js')

export function init () {
  let markdown = createInstance()
  markdown = setPlugin(markdown)

  return markdown
}

function createInstance () {
  let md = new MarkdownIt({
    html: true,
    xhtmlOut: false,
    breaks: true,
    langPrefix: 'language-',
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      const language = (!lang || lang === 'html') ? 'markup' : lang
      try {
        if (!Prism.languages[language]) {
          require(`prismjs/components/prism-${language}.min.js`)
        }
        if (Prism.languages[language]) {
          return Prism.highlight(str, Prism.languages[language])
        }
      } catch (__) {
        console.error(__);
        return '';
      }

      return ''
    }
  })

  return md
}

function setPlugin (markdown) {
  return markdown
    .use(MarkdownItCheckbox, {
      idPrefix: 'checkbox_'
    })
    .use(MarkdownItFootnote)
}
