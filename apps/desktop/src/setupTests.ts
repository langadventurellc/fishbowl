/**
 * Jest testing setup file.
 *
 * Configures Jest environment with testing utilities and global setup
 * for React Testing Library and custom matchers.
 */

import "@testing-library/jest-dom";

// Mock ResizeObserver for tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).ResizeObserver = class ResizeObserver {
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
