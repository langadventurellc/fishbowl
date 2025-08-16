const baseConfig = require("@fishbowl-ai/eslint-config/react");

module.exports = [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    settings: {
      react: {
        version: "detect",
        runtime: "automatic", // Tell ESLint about new JSX transform
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // React Native specific rules
      "react/react-in-jsx-scope": "off", // Not needed in React Native
    },
  },
  {
    files: [
      "**/__tests__/**/*",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/setup.ts",
    ],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "import/no-extraneous-dependencies": "off",
      "statement-count/function-statement-count-warn": "off",
      "statement-count/function-statement-count-error": "off",
      "statement-count/class-statement-count-warn": "off",
      "statement-count/class-statement-count-error": "off",
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
  {
    ignores: ["node_modules/", ".expo/", "dist/", "*.config.js"],
  },
];
