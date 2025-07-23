module.exports = {
  preset: "react-native",
  transformIgnorePatterns: [],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/"
  ],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}"
  ]
};
