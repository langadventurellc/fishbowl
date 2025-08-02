const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const turbo = require("eslint-plugin-turbo");
const globals = require("globals");
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
      react: react,
      "react-hooks": reactHooks,
      turbo: turbo,
      "statement-count": statementCountPlugin,
      "multiple-exports": multipleExportsPlugin,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "detect",
        runtime: "automatic", // Enable new JSX transform
      },
    },
    rules: {
      // Disable the base rule to avoid conflicts
      "no-unused-vars": "off",
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off", // Disable React usage detection for new JSX transform
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
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
