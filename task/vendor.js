'use strict';

var fs = require('fs');
var UglifyJS = require("uglify-js");
var CleanCSS = require('clean-css');
var packageJson = require('../package.json');

// ベースのディレクトリが無い場合は作成する
var baseJsDir = './dist/js';
if (!fs.existsSync(baseJsDir)){
    fs.mkdirSync(baseJsDir);
}

// 定義json取得
var json = JSON.parse(fs.readFileSync(packageJson.config.manifest, 'utf8'));

/**
 * vendor js build
 */
var uglified = UglifyJS.minify(json.js.vendor);
var jsOut = baseJsDir + '/vendor.min.js';

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
// ベースのディレクトリが無い場合は作成する
var baseCssDir = './dist/css';
if (!fs.existsSync(baseCssDir)){
    fs.mkdirSync(baseCssDir);
}
var cssOut = baseCssDir + '/vendor.min.css';

fs.writeFile(cssOut, cleaned, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("CSS generated and saved:", 'vendor.min.css');
    }
});
