const reactConfig = require("@fishbowl-ai/eslint-config/react");

module.exports = [
  ...reactConfig,
  {
    ignores: ["dist/", "src-tauri/", "node_modules/"],
  },
];