import "@testing-library/react-native/extend-expect";

// Mock Expo modules that are needed for tests
jest.mock("expo-status-bar", () => ({
  StatusBar: "StatusBar",
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Icon",
}));

// Mock React Navigation
jest.mock("@react-navigation/native", () => ({
  NavigationContainer: ({ children }) => children,
}));

jest.mock("@react-navigation/bottom-tabs", () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Setup globals
global.__DEV__ = true;
