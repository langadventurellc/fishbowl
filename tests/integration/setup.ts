import { vi } from 'vitest';

// Enhanced setup for integration tests
// Mock process object for preload context
Object.defineProperty(globalThis, 'process', {
  value: {
    contextIsolated: true,
    listeners: vi.fn(() => []),
    platform: 'test',
    env: {
      NODE_ENV: 'test',
    },
  },
  writable: true,
  configurable: true,
});

// Mock performance API if not available
if (!globalThis.performance) {
  Object.defineProperty(globalThis, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
    },
    writable: true,
    configurable: true,
  });
}

// Mock navigator if not available
if (!globalThis.navigator) {
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      userAgent: 'test-user-agent',
    },
    writable: true,
    configurable: true,
  });
}

// Mock window and location for renderer tests
if (!globalThis.window) {
  Object.defineProperty(globalThis, 'window', {
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

// Mock localStorage for React hooks
if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
    configurable: true,
  });
}

// Mock better-sqlite3 for database tests
vi.mock('better-sqlite3', () => {
  const mockDb = {
    prepare: vi.fn(() => ({
      run: vi.fn(),
      get: vi.fn(),
      all: vi.fn(() => []),
    })),
    close: vi.fn(),
    exec: vi.fn(),
    transaction: vi.fn(fn => fn),
  };

  return {
    default: vi.fn(() => mockDb),
  };
});

// Mock keytar for secure storage tests
vi.mock('keytar', () => ({
  setPassword: vi.fn(),
  getPassword: vi.fn(),
  deletePassword: vi.fn(),
  findCredentials: vi.fn(() => []),
  findPassword: vi.fn(),
}));

// Mock Electron modules
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  app: {
    getPath: vi.fn(() => ':memory:'),
    getName: vi.fn(() => 'fishbowl-test'),
  },
}));
