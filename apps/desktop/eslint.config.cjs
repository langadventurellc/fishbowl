const reactConfig = require("@fishbowl-ai/eslint-config/react");

module.exports = [
  ...reactConfig,
  {
    ignores: ["dist/", "dist-electron/", "node_modules/", "src/components/ui/"],
  },
];