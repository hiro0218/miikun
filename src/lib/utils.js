import electron from 'electron';
const { remote } = electron;

export const isURL = (str) => {
  return /(?:^\w+:|^)\/\/(?:[^\s\.]+\.\S{2}|localhost[\:?\d]*)/.test(str);
};

export const openLinkExternal = () => {
  const currentWindow = remote.getCurrentWindow();

  document.addEventListener('click', (e) => {
    if (e.target.tagName !== 'A') return;
    const href = e.target.getAttribute('href');

    if (isURL(href)) {
      e.preventDefault();
      // get status
      const status = currentWindow.isAlwaysOnTop();
      // on top
      currentWindow.setAlwaysOnTop(true);
      // open link
      remote.shell.openExternal(href);
      // restore
      if (!status) {
        setTimeout(function () {
          currentWindow.setAlwaysOnTop(false);
        }, 1000);
      }
    }
  });
};

export const getLinkWithTitle = (event) => {
  const pastedString = event.clipboardData.getData('text/plain');

  // クリップボードの内容がURLの場合、`[title](url)`形式で返却する
  if (!isURL(pastedString)) return;

  event.preventDefault();

  return fetch(pastedString, {
    method: 'get',
  })
    .then((res) => res.text())
    .then((text) => new DOMParser().parseFromString(text, 'text/html'))
    .then((parsedBody) => `[${parsedBody.title}](${pastedString})`)
    .then((assembledString) => {
      // 組み立てた文字列を挿入
      return assembledString;
    })
    .catch((e) => {
      // 見つからない場合は貼り付けたテキストをそのまま挿入
      return pastedString;
    });
};
