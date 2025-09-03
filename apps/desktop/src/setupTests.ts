/**
 * Jest testing setup file.
 *
 * Configures Jest environment with testing utilities and global setup
 * for React Testing Library and custom matchers.
 */

import "@testing-library/jest-dom";

// Polyfill TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock ResizeObserver for tests
globalThis.ResizeObserver = class ResizeObserver {
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
};

// Mock window.addEventListener and removeEventListener for resize events
Object.defineProperty(window, "addEventListener", {
  value: () => {},
  writable: true,
});

Object.defineProperty(window, "removeEventListener", {
  value: () => {},
  writable: true,
});

// Mock window.innerWidth for responsive tests
Object.defineProperty(window, "innerWidth", {
  value: 1024,
  writable: true,
});

// Mock scrollIntoView for Radix UI components
Element.prototype.scrollIntoView = () => {};

// Suppress React 19 act warnings in tests
// These warnings are known issues with React 19 + Testing Library for async hook state updates
// See: https://github.com/testing-library/react-testing-library/issues/1051
const originalError = console.error;
global.beforeEach(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("An update to") &&
      args[0].includes("inside a test was not wrapped in act")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

global.afterEach(() => {
  console.error = originalError;
});
