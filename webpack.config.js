module.exports = {
    entry: './renderer/js/app.js',
    output: {
        path: __dirname,
        filename: './dist/app.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    },
    resolve: {
        extensions: ['', '.js']
    }
};
