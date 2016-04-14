const shell = require('electron').shell;

document.addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target.tagName.toLowerCase() === 'a') {
        if (e.target.getAttribute('href').substring(0, 4) == "http") {
            shell.openExternal(e.target.href);
        }
    }
});
