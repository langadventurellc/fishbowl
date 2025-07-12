import { vi } from 'vitest';

// Mock zustand for proper test isolation
vi.mock('zustand');

// Polyfill process.listeners for vitest compatibility
if (!process.listeners) {
  process.listeners = vi.fn(() => []);
}

// Extend the existing process object with missing methods for preload context
// Using stubGlobal for better isolation and automatic cleanup
vi.stubGlobal('process', {
  ...process,
  contextIsolated: true,
});

// Mock performance API using stubGlobal
vi.stubGlobal('performance', {
  now: vi.fn(() => Date.now()),
});

// Mock navigator using stubGlobal
vi.stubGlobal('navigator', {
  userAgent: 'test-user-agent',
});

// Note: 'window' and 'localStorage' are now provided by the 'jsdom' environment.
// You generally won't need to mock them here unless you need to override
// specific properties for a test, which should be done within the test file itself.
