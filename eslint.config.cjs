const baseConfig = require("@fishbowl-ai/eslint-config");

module.exports = [
  ...baseConfig,
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/", 
      ".next/",
      ".turbo/",
      "apps/*/android/",
      "apps/*/ios/",
    ],
  },
];