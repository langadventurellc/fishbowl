const baseConfig = require("@fishbowl-ai/eslint-config");

module.exports = [
  ...baseConfig,
  {
    ignores: ["dist/", "node_modules/"],
  },
  // Add fetch as global for Node.js 18+ environments
  {
    languageOptions: {
      globals: {
        fetch: "readonly",
      },
    },
  },
  // Jest configuration for test files
  {
    files: [
      "**/__tests__/**/*",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
    ],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "off",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
];