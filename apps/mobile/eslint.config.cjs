const baseConfig = require('@fishbowl-ai/eslint-config/react');

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    settings: {
      react: {
        version: 'detect',
        runtime: 'automatic', // Tell ESLint about new JSX transform
      },
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // React Native specific rules
      'react/react-in-jsx-scope': 'off', // Not needed in React Native
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/__tests__/**/*', '**/*.test.ts', '**/*.test.tsx', '**/setup.ts'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      '*.config.js',
    ],
  },
];