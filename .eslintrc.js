module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended",
    "prettier"
  ],
  globals: {
    __static: true
  },
  plugins: [
    "vue",
    "prettier"
  ],
  'rules': {
    "prettier/prettier": ["error", {
      "printWidth": 120,
      "trailingComma": "all",
      "singleQuote": true,
      "semi": true
    }],
    "no-var": 0,
    "no-unused-vars": ["error", { "args": "none" }],
    "no-underscore-dangle": 0,
    "no-inner-declarations": 0,
    "comma-dangle": ["error", "always-multiline"],
    "prefer-arrow-callback": 0,
    "no-console": 0,
    "no-continue": 0,
    "object-shorthand": 0,
    "quotes": ["error", "single"],
    "no-param-reassign": 0,
    "vars-on-top": 0,
    "func-names": 0,
    "consistent-return": 0,
    "global-require": 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    "vue/max-attributes-per-line": 0,
  }
}
