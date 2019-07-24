import electron from 'electron';
const { remote } = electron;

export const isURL = str => {
  return /(?:^\w+:|^)\/\/(?:[^\s\.]+\.\S{2}|localhost[\:?\d]*)/.test(str);
};

export const openLinkExternal = () => {
  const currentWindow = remote.getCurrentWindow();

  document.addEventListener('click', e => {
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
        setTimeout(function() {
          currentWindow.setAlwaysOnTop(false);
        }, 1000);
      }
    }
  });
};
