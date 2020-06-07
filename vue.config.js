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
      sass: {
        prependData: '@import "./src/assets/style/Settings/index.scss";',
      },
    },
  },

  pluginOptions: {
    electronBuilder: {
      // List native deps here if they don't work
      externals: ['my-native-dep'],
      // If you are using Yarn Workspaces, you may have multiple node_modules folders
      // List them all here so that VCP Electron Builder can find them
      nodeModulesPath: ['../../node_modules', './node_modules'],
    },
  },

  productionSourceMap: false,
};
