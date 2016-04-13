'use strict';

var fs = require('fs');
var CleanCSS = require('clean-css');

// 定義json取得
var json = JSON.parse(fs.readFileSync('./build/manifest.json', 'utf8'));

// uglify
var cleaned = new CleanCSS().minify(json.css.vendor);

fs.writeFile('./dist/vendor.min.css', cleaned.styles, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("CSS generated and saved:", 'vendor.min.css');
    }
});
