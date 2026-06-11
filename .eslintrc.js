module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: ['prettier', 'plugin:vue/recommended', 'plugin:prettier/recommended'],
  plugins: ['vue', 'prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-var': 0,
    'no-unused-vars': [
      'error',
      {
        args: 'none',
      },
    ],
    'no-underscore-dangle': 0,
    'no-inner-declarations': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'prefer-arrow-callback': 0,
    'no-continue': 0,
    'object-shorthand': 0,
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'no-param-reassign': 0,
    'vars-on-top': 0,
    'func-names': 0,
    'consistent-return': 0,
    'global-require': 0,
    'prefer-const': 2,
    'max-depth': ['error', 3],
    'vue/max-attributes-per-line': 'off',
    'vue/no-v-html': 0,
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
        },
      },
    ],
    'vue/singleline-html-element-content-newline': 0,
  },
};
