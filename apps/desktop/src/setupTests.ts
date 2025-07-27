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
