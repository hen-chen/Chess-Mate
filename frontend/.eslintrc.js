/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'prefer-destructuring': ['warn', { object: true, array: true }],
    'prefer-template': 'error',
    eqeqeq: 'error',
    'no-duplicate-imports': 'error',
    'prefer-arrow-callback': 'error',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
