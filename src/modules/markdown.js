import MarkdownIt from 'markdown-it';
import MarkdownItCheckbox from 'markdown-it-checkbox';
import MarkdownItFootnote from 'markdown-it-footnote';
import MarkdownItMultimdTable from 'markdown-it-multimd-table';
import MarkdownItDeflist from 'markdown-it-deflist';

import Prism from 'prismjs';
import 'prismjs/plugins/remove-initial-line-feed/prism-remove-initial-line-feed.min.js';

export const initMarkdown = () => {
  let markdown = new MarkdownIt({
    html: true,
    xhtmlOut: false,
    breaks: true,
    langPrefix: 'language-',
    linkify: true,
    typographer: false,
    highlight: function(str, lang) {
      const language = !lang || lang === 'html' ? 'markup' : lang;
      try {
        if (!Prism.languages[language]) {
          require(`prismjs/components/prism-${language}.min.js`);
        }
        if (Prism.languages[language]) {
          return Prism.highlight(str, Prism.languages[language]);
        }
      } catch (__) {
        // eslint-disable-next-line
        console.error(__);
      }

      return '';
    },
  });

  markdown
    .use(MarkdownItCheckbox, {
      idPrefix: 'checkbox_',
    })
    .use(MarkdownItFootnote)
    .use(MarkdownItMultimdTable, { enableRowspan: true })
    .use(MarkdownItDeflist);

  return markdown;
};
