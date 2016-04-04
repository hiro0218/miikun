'use strict';

var fs = require('fs');
var uglify = require("uglify-js");

// 定義json取得
var json = JSON.parse(fs.readFileSync('./build/vendor.json', 'utf8'));

// uglify.minify
var uglified = uglify.minify(json.js.vendor);
fs.writeFile('./dist/vendor.min.js', uglified.code, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("Script generated and saved:", 'vendor.min.js');
    }
});
