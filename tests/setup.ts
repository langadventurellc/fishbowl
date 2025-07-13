import { vi } from 'vitest';

// Mock zustand for proper test isolation
vi.mock('zustand');

// Polyfill process.listeners for vitest compatibility
if (!process.listeners) {
  process.listeners = vi.fn(() => []);
}

// Extend the existing process object with missing methods for preload context
if (!(process as any).contextIsolated) {
  (process as any).contextIsolated = true;
}

// Mock performance API if not available
if (!global.performance) {
  Object.defineProperty(global, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
    },
    writable: true,
    configurable: true,
  });
}

// Mock navigator if not available
if (!global.navigator) {
  Object.defineProperty(global, 'navigator', {
    value: {
      userAgent: 'test-user-agent',
    },
    writable: true,
    configurable: true,
  });
}

// Mock window location if not available
if (!global.window) {
  Object.defineProperty(global, 'window', {
    value: {
      location: {
        origin: 'https://test.com',
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    writable: true,
    configurable: true,
  });
}

// Mock globalThis if not available
if (!global.globalThis) {
  Object.defineProperty(global, 'globalThis', {
    value: global,
    writable: true,
    configurable: true,
  });
}
