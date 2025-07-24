const baseConfig = require("@fishbowl-ai/eslint-config");

module.exports = [
  ...baseConfig,
  {
    // Configuration for Node.js config files
    files: ['**/*.config.js', '**/jest.config.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    // Configuration for E2E test files and support files
    files: ['**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts', '**/support/**/*.js'],
    languageOptions: {
      globals: {
        // Node.js globals
        require: 'readonly',
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        // Detox globals
        device: 'readonly',
        waitFor: 'readonly',
        element: 'readonly',
        by: 'readonly',
      },
    },
    // Disable custom linter rules for E2E test projects
    rules: {
      'statement-count/function-statement-count-warn': 'off',
      'statement-count/function-statement-count-error': 'off',
      'statement-count/class-statement-count-warn': 'off',
      'statement-count/class-statement-count-error': 'off',
      'multiple-exports/no-multiple-exports': 'off',
    },
  },
  {
    ignores: [
      'node_modules/',
    ],
  },
];