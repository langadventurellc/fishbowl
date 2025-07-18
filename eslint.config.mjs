import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { multipleExportsPlugin, statementCountPlugin } from '@langadventurellc/tsla-linter';
import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/out/**',
      '**/.cache/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/.vscode/**',
      '**/assets/**',
      '**/scripts/**',
      '**/__mocks__/**',
      'eslint.config.mjs',
      'esbuild.preload.mjs',
      'vite.config.ts',
    ],
  },

  // Base configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'max-lines': ['warn', { max: 600, skipBlankLines: true }],
      'prefer-template': 'error',
      'object-shorthand': 'error',

      // React specific rules
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      'react/prop-types': 'off', // Using TypeScript instead
      'react/jsx-uses-react': 'off', // Not needed with React 17+
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-boolean-value': 'error',
      'react/jsx-curly-brace-presence': ['error', 'never'],
      'react/self-closing-comp': 'error',
      'react/jsx-fragments': ['error', 'syntax'],
      'react/no-array-index-key': 'warn',
      'react/no-danger': 'warn',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-multi-comp': 'error',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // SonarJS configuration
  {
    ...sonarjs.configs.recommended,
    ignores: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*'],
    rules: {
      'sonarjs/deprecation': 'warn',
      'sonarjs/no-duplicate-string': 'off', // Can be overly restrictive
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',
    },
  },

  // Custom plugins and rules
  {
    ignores: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*'],
    plugins: {
      'statement-count': statementCountPlugin,
      'multiple-exports': multipleExportsPlugin,
    },
    rules: {
      'statement-count/function-statement-count-warn': ['warn', { threshold: 50 }],
      'statement-count/function-statement-count-error': ['error', { threshold: 80 }],
      'statement-count/class-statement-count-warn': ['warn', { threshold: 150 }],
      'statement-count/class-statement-count-error': ['error', { threshold: 200 }],
      'multiple-exports/no-multiple-exports': 'error',
    },
  },

  // Configuration for JavaScript files (disable type-aware linting)
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  // Configuration for test files
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/tests/**/*'],
    rules: {
      'max-lines': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  // Prettier integration - must be last to override other configs
  prettierConfig,
];

export default eslintConfig;
