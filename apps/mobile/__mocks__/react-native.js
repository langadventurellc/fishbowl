const React = require("react");

// Mock StyleSheet
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
  compose: (style1, style2) => [style1, style2].filter(Boolean),
  hairlineWidth: 1,
  absoluteFillObject: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};

// Mock basic components
const View = ({ children, ...props }) =>
  React.createElement("View", props, children);
const Text = ({ children, ...props }) =>
  React.createElement("Text", props, children);
const TouchableOpacity = ({ children, ...props }) =>
  React.createElement("TouchableOpacity", props, children);
const ScrollView = ({ children, ...props }) =>
  React.createElement("ScrollView", props, children);
const Image = (props) => React.createElement("Image", props);
const TextInput = (props) => React.createElement("TextInput", props);

// Mock Platform
const Platform = {
  OS: "ios",
  Version: 16,
  select: (obj) => obj.ios || obj.default,
};

// Mock Dimensions
const Dimensions = {
  get: (dim) => {
    if (dim === "window") {
      return { width: 375, height: 812, scale: 1, fontScale: 1 };
    }
    if (dim === "screen") {
      return { width: 375, height: 812, scale: 1, fontScale: 1 };
    }
    return { width: 0, height: 0, scale: 1, fontScale: 1 };
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

module.exports = {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
  Dimensions,
  // Add other commonly used exports as needed
};
