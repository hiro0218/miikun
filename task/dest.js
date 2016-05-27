var cpx = require("cpx");
var source = "./node_modules/material-design-icons/iconfont/*.{ttf,woff,woff2}",
    dest = "./assets/font/";

// Google Material Design icon をコピー
cpx.copy(source, dest, function(err) {
    if (err) {
        return console.error(err);
    }
    console.log('done!');
});
