const baseConfig = require("@fishbowl-ai/eslint-config");

module.exports = [
  ...baseConfig,
  {
    ignores: ["dist/", "node_modules/"],
  },
];