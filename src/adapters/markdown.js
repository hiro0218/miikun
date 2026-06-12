import MarkdownIt from 'markdown-it';
import MarkdownItCheckbox from 'markdown-it-checkbox';
import MarkdownItFootnote from 'markdown-it-footnote';
import MarkdownItMultimdTable from 'markdown-it-multimd-table';
import MarkdownItDeflist from 'markdown-it-deflist';
import MarkdownItAnchor from 'markdown-it-anchor';

import { createHighlighter, bundledLanguages } from 'shiki';

const THEMES = { light: 'github-light', dark: 'github-dark' };
const FENCE_LANG_PATTERN = /^ {0,3}(?:`{3,}|~{3,}) *(\S+)/gm;

export default class Markdown {
  constructor() {
    this.highlighter = null;
    this.loadedLanguages = new Set();
    this.highlighterReady = createHighlighter({
      themes: Object.values(THEMES),
      langs: [],
    }).then((highlighter) => {
      this.highlighter = highlighter;
      return highlighter;
    });

    this.markdownIt = new MarkdownIt({
      html: true,
      xhtmlOut: false,
      breaks: true,
      langPrefix: 'language-',
      linkify: true,
      typographer: false,
      highlight: (str, lang) => this.highlight(str, lang),
    });

    this.markdownIt
      .use(MarkdownItCheckbox, {
        idPrefix: 'checkbox_',
      })
      .use(MarkdownItFootnote)
      .use(MarkdownItAnchor)
      .use(MarkdownItMultimdTable, { enableRowspan: true })
      .use(MarkdownItDeflist);
  }

  highlight(str, lang) {
    const language = lang.toLowerCase();
    if (!this.loadedLanguages.has(language)) {
      return '';
    }
    const code = str.endsWith('\n') ? str.slice(0, -1) : str;
    return this.highlighter.codeToHtml(code, {
      lang: language,
      themes: THEMES,
    });
  }

  async render(markdown) {
    await this.loadFenceLanguages(markdown);
    return this.markdownIt.render(markdown);
  }

  // Shiki loads grammars asynchronously while markdown-it's highlight hook is
  // synchronous, so every fence language must be resolved before rendering.
  async loadFenceLanguages(markdown) {
    const requested = new Set();

    for (const match of markdown.matchAll(FENCE_LANG_PATTERN)) {
      const language = match[1].toLowerCase();
      if (!this.loadedLanguages.has(language) && language in bundledLanguages) {
        requested.add(language);
      }
    }

    if (requested.size === 0) {
      return;
    }

    const highlighter = this.highlighter || (await this.highlighterReady);
    await Promise.all(
      [...requested].map(async (language) => {
        await highlighter.loadLanguage(language);
        this.loadedLanguages.add(language);
      }),
    );
  }
}
