const baseConfig = require("@fishbowl-ai/eslint-config");

module.exports = [
  ...baseConfig,
  {
    // Configuration for E2E test files
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        // Node.js globals
        __dirname: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        process: 'readonly',
        global: 'readonly',
        console: 'readonly',
      },
    },
    // Disable custom linter rules for E2E test projects
    rules: {
      'statement-count/function-statement-count-warn': 'off',
      'statement-count/function-statement-count-error': 'off',
      'statement-count/class-statement-count-warn': 'off',
      'statement-count/class-statement-count-error': 'off',
      "multiple-exports/no-multiple-exports": [
        "error",
        {
          checkClasses: true,
          checkFunctions: true,
          checkInterfaces: true,
          checkTypes: true,
          checkVariables: true,
          excludeConstants: true,
          ignoreBarrelFiles: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: [
      'node_modules/',
      'playwright-report/',
      'test-results/',
    ],
  },
];