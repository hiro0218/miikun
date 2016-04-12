var packager = require('electron-packager');
var packageJson = require('../package.json');

var option = {
    dir: './',
    out: './release',
    platform: 'darwin,win32',
    arch: 'x64',

    name: packageJson.name,
    // icon: './icon',

    'app-bundle-id': 'jp.0218.app.Miikun',
    'app-version': packageJson.version,
    'version-string': {
        FileDescription: packageJson.description,
        FileVersion: packageJson.version,
        ProductName: packageJson.name,
        ProductVersion: packageJson.version,
        CompanyName: packageJson.author,
        OriginalFilename: packageJson.name,
        InternalName: packageJson.name,
        LegalCopyright:  packageJson.copyright,
    },

    overwrite: true,
    prune: true,
    // asar: true,

    ignore: [
        "vendor/",
        'assets/[^(font)]',
        'build',
        "/(.gitignore|.bowerrc|.editorconfig|.gitattributes|bower.json|README.md)"
    ],
};

packager(option, function done(err, appPath) {
    if (err) {
        throw new Error(err);
    }
    console.log('package done.');
});
