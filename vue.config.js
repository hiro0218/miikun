const path = require('path');

module.exports = {
  devServer: {
    port: 8888,
    disableHostCheck: true,
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.join(__dirname, './src'),
      },
    },
  },
  css: {
    loaderOptions: {
      scss: {
        data: '@import "./src/assets/style/Settings/index.scss";',
      },
    },
  },
  pluginOptions: {
    electronBuilder: {
      externals: ['my-native-dep'],
      nodeModulesPath: ['../../node_modules', './node_modules'],
    },
  },
  productionSourceMap: false,
  transpileDependencies: ['vuetify'],
};
