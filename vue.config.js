const path = require('path');
const sassVariablesPath = path.join(__dirname, 'src/assets/style/Settings/_variables.scss').replace(/\\/g, '/');

module.exports = {
  lintOnSave: false,
  devServer: {
    port: 8888,
    allowedHosts: 'all',
  },
  configureWebpack: {
    target: 'electron-renderer',
    externals: {
      child_process: 'commonjs2 child_process',
      crypto: 'commonjs2 crypto',
      electron: 'commonjs2 electron',
      fs: 'commonjs2 fs',
      path: 'commonjs2 path',
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, './src'),
      },
    },
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@use "${sassVariablesPath}" as *;`,
        implementation: require('sass'),
      },
    },
  },
  pluginOptions: {
    electronBuilder: {
      externals: ['my-native-dep'],
      nodeModulesPath: ['../../node_modules', './node_modules'],
      builderOptions: {
        appId: 'jp.0218.miikun',
        mac: {
          target: ['zip'],
        },
      },
    },
  },
  productionSourceMap: false,
  transpileDependencies: ['vuetify'],
};
