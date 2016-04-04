'use strict';

var fs = require('fs');
var CleanCSS = require('clean-css');

// 定義json取得
var json = JSON.parse(fs.readFileSync('./build/vendor.json', 'utf8'));

// uglify
var uglified = new CleanCSS().minify(json.css.vendor);

fs.writeFile('./dist/vendor.min.css', uglified.styles, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("CSS generated and saved:", 'vendor.min.css');
    }
});
