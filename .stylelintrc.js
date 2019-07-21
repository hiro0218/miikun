module.exports = {
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-recommended-scss',
    'stylelint-config-property-sort-order-smacss',
  ],
  plugins: [
    'stylelint-declaration-block-no-ignored-properties',
  ],
  rules: {
    'plugin/declaration-block-no-ignored-properties': true,
    'no-empty-source': true,
    'color-hex-length': 'short',
    'color-no-invalid-hex': true,
    'indentation': 2,
    'length-zero-no-unit': true,
    "max-empty-lines": 2,
    'number-leading-zero': 'never',
    'string-quotes': 'single',
    'declaration-block-no-duplicate-properties': [
      true,
      {
        ignore: [
          'consecutive-duplicates'
        ]
      }
    ],
    'block-opening-brace-space-before': 'always',
    'block-opening-brace-newline-after': 'always',
    'block-closing-brace-newline-after': 'always',
    'block-closing-brace-newline-before': 'always',
    'selector-list-comma-space-before': 'never',
    'selector-list-comma-newline-after': 'always',
    'selector-pseudo-element-colon-notation': 'double',
    'value-list-comma-newline-after': 'always-multi-line',
    'value-list-comma-space-after': 'always-single-line',
    'value-list-comma-space-before': 'never',
    'declaration-block-trailing-semicolon': 'always',
    'declaration-block-semicolon-newline-after': 'always-multi-line',
    'declaration-block-semicolon-newline-before': 'never-multi-line',
    'declaration-block-semicolon-space-after': 'always-single-line',
    'no-extra-semicolons': true,
    'no-missing-end-of-source-newline': true,
  },
};
