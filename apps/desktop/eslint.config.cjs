const reactConfig = require("@fishbowl-ai/eslint-config/react");
const globals = require("globals");

module.exports = [
  ...reactConfig,
  {
    ignores: ["dist/", "dist-electron/", "node_modules/", "src/components/ui/"],
  },
  // Jest globals for test files
  {
    files: [
      "**/__tests__/**/*",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/setup.ts",
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests for mocking
    },
  },
];