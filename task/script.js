'use strict';

var fs = require('fs');
var UglifyJS = require("uglify-js");

/**
 * js build
 */
var uglified = UglifyJS.minify('./renderer/js/script.js');
var out = './dist/script.min.js';

fs.writeFile(out, uglified.code, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("Script generated and saved:", 'script.min.js');
    }
});
