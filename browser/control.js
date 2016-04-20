const shell = require('electron').shell;

document.addEventListener('click', function (e) {
    if (e.target.tagName.toLowerCase() === 'a') {
        if (e.target.getAttribute('href').substring(0, 4) == "http") {
            e.preventDefault();
            shell.openExternal(e.target.href);
        }
    }
});
