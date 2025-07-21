const reactConfig = require("@fishbowl-ai/eslint-config/react");

module.exports = [
  ...reactConfig,
  {
    languageOptions: {
      globals: {
        // React Native globals
        __DEV__: "readonly",
        global: "readonly",
      },
    },
  },
  {
    ignores: ["android/", "ios/", "node_modules/"],
  },
];