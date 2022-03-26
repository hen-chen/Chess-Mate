module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'prefer-arrow-callback': 'error',
    'prefer-destructuring': ['warn', { object: true, array: true }],
    'prefer-template': 'error',
    eqeqeq: 'error',
    'no-undef': 'off',
  },
}
