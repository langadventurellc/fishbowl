const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const turbo = require("eslint-plugin-turbo");
const {
  multipleExportsPlugin,
  statementCountPlugin,
} = require("@langadventurellc/tsla-linter");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
      turbo: turbo,
      "statement-count": statementCountPlugin,
      "multiple-exports": multipleExportsPlugin,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // Disable the base rule to avoid conflicts
      "no-unused-vars": "off",
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "statement-count/function-statement-count-warn": "warn",
      "statement-count/function-statement-count-error": "error",
      "statement-count/class-statement-count-warn": "warn",
      "statement-count/class-statement-count-error": "error",
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
    },
  },
  // Configuration for test files
  {
    files: [
      "**/__tests__/**/*",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/setup.ts",
    ],
    rules: {
      "statement-count/function-statement-count-warn": "off",
      "statement-count/function-statement-count-error": "off",
      "statement-count/class-statement-count-warn": "off",
      "statement-count/class-statement-count-error": "off",
      "multiple-exports/no-multiple-exports": "off",
    },
  },
];
