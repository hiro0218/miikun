module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ['prettier', 'plugin:prettier/recommended'],
  plugins: ['prettier', '@typescript-eslint'],
  ignorePatterns: ['out/', 'dist/', 'dist_electron/'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-var': 0,
    'no-unused-vars': [
      'error',
      {
        args: 'none',
        varsIgnorePattern: '^[A-Z]',
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
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'electron', message: 'Use @/adapters/electron instead of importing Electron APIs directly.' },
          { name: '@electron/remote', message: 'Use @/adapters/electron instead of importing Electron APIs directly.' },
          { name: 'fs', message: 'Use @/adapters/filesystem instead of Node fs directly.' },
          { name: 'crypto', message: 'Use @/adapters/encryptor instead of Node crypto directly.' },
          { name: 'codemirror', message: 'Use @/adapters/editor instead of importing CodeMirror directly.' },
          {
            name: 'markdown-it',
            message: 'Use @/adapters/markdown instead of importing the Markdown renderer directly.',
          },
          { name: 'shiki', message: 'Use @/adapters/markdown instead of importing the syntax highlighter directly.' },
        ],
        patterns: [
          {
            group: ['@codemirror/*', '@lezer/*'],
            message: 'Use @/adapters/editor instead of importing CodeMirror directly.',
          },
          {
            group: ['markdown-it-*', 'shiki/*', '@shikijs/*'],
            message: 'Use @/adapters/markdown instead of importing the Markdown renderer directly.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'none',
            varsIgnorePattern: '^[A-Z]',
          },
        ],
      },
    },
    {
      files: ['src/adapters/**/*.{js,ts}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/store', '@/store/**', '**/store', '**/store/**'],
                message: 'Adapters must not depend on the store; pass state in from the caller.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/background.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};
