'use strict';

var fs = require('fs');
var sass = require('node-sass');

// ベースのディレクトリが無い場合は作成する
var baseDir = './dist/css';
if (!fs.existsSync(baseDir)){
    fs.mkdirSync(baseDir);
}

var options = {
    file: './renderer/scss/style.scss',
    outFile: baseDir + '/style.min.css',
    includePaths: require('node-neat').includePaths,
    outputStyle:  'expanded',
};

sass.render(options, function(error, result) {
    if (error) {
        console.log(error.status);
        console.log(error.column);
        console.log(error.message);
        console.log(error.line);

    } else {
        var CleanCSS = require('clean-css');
        var cleaned = new CleanCSS().minify(result.css.toString()).styles;

        fs.writeFile(options.outFile, cleaned, function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("CSS generated and saved:", 'style.min.css');
            }
        });
    }
});
