module.exports = {
  extends: [
    '@eslint/js/recommended',
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'turbo'],
  rules: {
    'turbo/no-undeclared-env-vars': 'warn',
  },
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
};