'use strict';

var fs = require('fs');
var UglifyJS = require("uglify-js");
var CleanCSS = require('clean-css');
var packageJson = require('../package.json');

// 定義json取得
var json = JSON.parse(fs.readFileSync(packageJson.config.manifest, 'utf8'));

/**
 * vendor js build
 */
var uglified = UglifyJS.minify(json.js.vendor);
var jsOut = './dist/vendor.min.js';

fs.writeFile(jsOut, uglified.code, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("Script generated and saved:", 'vendor.min.js');
    }
});

/**
 * vendor css build
 */
var cleaned = new CleanCSS().minify(json.css.vendor).styles;
var cssOut = './dist/vendor.min.css';

fs.writeFile(cssOut, cleaned, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("CSS generated and saved:", 'vendor.min.css');
    }
});
