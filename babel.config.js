module.exports = function(api) {
  api.cache(true);
  const presets = [
    '@vue/app',
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
      },
    ],
  ];
  const plugins = ['@babel/plugin-transform-runtime'];
  const comments = false;

  return {
    comments,
    presets,
    plugins,
  };
};
