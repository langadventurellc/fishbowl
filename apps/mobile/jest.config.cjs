module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)",
    "<rootDir>/src/**/?(*.)(spec|test).(ts|tsx|js|jsx)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@fishbowl-ai/shared$": "<rootDir>/../../packages/shared/src",
    "^@fishbowl-ai/ui-theme$": "<rootDir>/../../packages/ui-theme/src",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native.*|@react-navigation.*|expo(nent)?|@expo(nent)?/.*|@expo/vector-icons|react-clone-referenced-element|@react-native-community|rollbar|@fishbowl-ai.*))",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/*.test.{ts,tsx}",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
