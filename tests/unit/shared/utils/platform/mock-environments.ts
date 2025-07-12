import { vi } from 'vitest';

/**
 * Mock environment interface for platform detection testing
 * Provides comprehensive mock environments for Electron, Capacitor, and Web platforms
 */
export interface MockEnvironment {
  /** Platform type identifier */
  readonly type: 'electron' | 'capacitor' | 'web' | 'mixed';
  /** Setup function to configure the mock environment */
  setup(): void;
  /** Cleanup function to restore original state */
  cleanup(): void;
  /** Reset function to clear all mocks */
  reset(): void;
}

/**
 * Mock Electron API object that simulates the preload-exposed electronAPI
 */
const createMockElectronAPI = () => ({
  // Window controls
  minimize: vi.fn(),
  maximize: vi.fn(),
  close: vi.fn(),

  // Application info
  getVersion: vi.fn(),

  // System info
  getSystemInfo: vi.fn(),
  platform: vi.fn(),
  arch: vi.fn(),
  version: vi.fn(),

  // Configuration
  getConfig: vi.fn(),
  setConfig: vi.fn(),

  // Theme system
  getTheme: vi.fn(),
  setTheme: vi.fn(),
  onThemeChange: vi.fn(),

  // Development tools
  isDev: vi.fn(),
  openDevTools: vi.fn(),
  closeDevTools: vi.fn(),

  // Database operations - Agents
  dbAgentsList: vi.fn(),
  dbAgentsGet: vi.fn(),
  dbAgentsCreate: vi.fn(),
  dbAgentsUpdate: vi.fn(),
  dbAgentsDelete: vi.fn(),

  // Database operations - Conversations
  dbConversationsList: vi.fn(),
  dbConversationsGet: vi.fn(),
  dbConversationsCreate: vi.fn(),
  dbConversationsUpdate: vi.fn(),
  dbConversationsDelete: vi.fn(),

  // Database operations - Messages
  dbMessagesList: vi.fn(),
  dbMessagesGet: vi.fn(),
  dbMessagesCreate: vi.fn(),
  dbMessagesUpdate: vi.fn(),
  dbMessagesDelete: vi.fn(),
  dbMessagesUpdateActiveState: vi.fn(),
  dbMessagesToggleActiveState: vi.fn(),

  // Secure storage operations
  keytarGetPassword: vi.fn(),
  keytarSetPassword: vi.fn(),
  keytarDeletePassword: vi.fn(),
  keytarFindCredentials: vi.fn(),

  // Event listeners
  onWindowFocus: vi.fn(),
  onWindowBlur: vi.fn(),
  onWindowResize: vi.fn(),
  onWindowMaximize: vi.fn(),
  onWindowUnmaximize: vi.fn(),
  onWindowMinimize: vi.fn(),
  onWindowRestore: vi.fn(),

  // Performance monitoring
  getPerformanceStats: vi.fn(),
  clearPerformanceStats: vi.fn(),

  // Security monitoring
  getSecurityStats: vi.fn(),
  clearSecurityAuditLog: vi.fn(),
});

/**
 * Mock Capacitor object that simulates Capacitor mobile environment
 */
const createMockCapacitor = () => ({
  platform: 'ios', // or 'android'
  isNativePlatform: () => true,
  isPluginAvailable: vi.fn(),
  Plugins: {
    Device: {
      getInfo: vi.fn().mockResolvedValue({
        platform: 'ios',
        operatingSystem: 'ios',
        osVersion: '16.0',
        manufacturer: 'Apple',
        model: 'iPhone',
        isVirtual: false,
        webViewVersion: '16.0',
      }),
    },
    App: {
      getInfo: vi.fn().mockResolvedValue({
        name: 'Fishbowl',
        id: 'com.fishbowl.app',
        build: '1.0.0',
        version: '1.0.0',
      }),
    },
    Storage: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
  },
});

/**
 * Store original global values for restoration
 */
const originalGlobals = {
  electronAPI: undefined as unknown,
  Capacitor: undefined as unknown,
  window: undefined as unknown,
  navigator: undefined as unknown,
};

/**
 * Electron environment mock - simulates Electron renderer process
 */
export const electronEnvironment: MockEnvironment = {
  type: 'electron' as const,

  setup() {
    // Store original values
    originalGlobals.electronAPI = (globalThis as any).electronAPI;
    originalGlobals.window = globalThis.window;

    // Mock window object if not present
    if (!globalThis.window) {
      Object.defineProperty(globalThis, 'window', {
        value: {
          electronAPI: createMockElectronAPI(),
          location: { origin: 'file://' },
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    } else {
      // Add electronAPI to existing window
      Object.defineProperty(globalThis.window, 'electronAPI', {
        value: createMockElectronAPI(),
        writable: true,
        configurable: true,
      });
    }

    // Also expose electronAPI at global level for direct access
    Object.defineProperty(globalThis, 'electronAPI', {
      value: globalThis.window.electronAPI,
      writable: true,
      configurable: true,
    });
  },

  cleanup() {
    // Restore original values
    if (originalGlobals.electronAPI !== undefined) {
      (globalThis as any).electronAPI = originalGlobals.electronAPI;
    } else {
      delete (globalThis as any).electronAPI;
    }

    if (originalGlobals.window !== undefined) {
      globalThis.window = originalGlobals.window as Window & typeof globalThis;
    } else if (globalThis.window && 'electronAPI' in globalThis.window) {
      delete (globalThis.window as any).electronAPI;
    }
  },

  reset() {
    if (globalThis.window?.electronAPI) {
      // Reset all mock functions in electronAPI
      Object.values(globalThis.window.electronAPI).forEach(fn => {
        if (typeof fn === 'function' && 'mockReset' in fn) {
          (fn as ReturnType<typeof vi.fn>).mockReset();
        }
      });
    }
  },
};

/**
 * Capacitor environment mock - simulates Capacitor mobile environment
 */
export const capacitorEnvironment: MockEnvironment = {
  type: 'capacitor' as const,

  setup() {
    // Store original values
    originalGlobals.Capacitor = (globalThis as any).Capacitor;
    originalGlobals.window = globalThis.window;

    // Mock window object if not present
    if (!globalThis.window) {
      Object.defineProperty(globalThis, 'window', {
        value: {
          Capacitor: createMockCapacitor(),
          location: { origin: 'capacitor://localhost' },
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    } else {
      // Add Capacitor to existing window
      Object.defineProperty(globalThis.window, 'Capacitor', {
        value: createMockCapacitor(),
        writable: true,
        configurable: true,
      });
    }

    // Also expose Capacitor at global level for direct access
    Object.defineProperty(globalThis, 'Capacitor', {
      value: (globalThis.window as any).Capacitor,
      writable: true,
      configurable: true,
    });
  },

  cleanup() {
    // Restore original values
    if (originalGlobals.Capacitor !== undefined) {
      (globalThis as any).Capacitor = originalGlobals.Capacitor;
    } else {
      delete (globalThis as any).Capacitor;
    }

    if (originalGlobals.window !== undefined) {
      globalThis.window = originalGlobals.window as Window & typeof globalThis;
    } else if (globalThis.window && 'Capacitor' in globalThis.window) {
      delete (globalThis.window as any).Capacitor;
    }
  },

  reset() {
    if ((globalThis.window as any)?.Capacitor) {
      // Reset all mock functions in Capacitor
      const capacitor = (globalThis.window as any).Capacitor;
      const plugins = capacitor.Plugins ?? {};
      Object.values(plugins as Record<string, unknown>).forEach((plugin: unknown) => {
        if (plugin && typeof plugin === 'object') {
          Object.values(plugin as Record<string, unknown>).forEach(fn => {
            if (typeof fn === 'function' && 'mockReset' in fn) {
              (fn as ReturnType<typeof vi.fn>).mockReset();
            }
          });
        }
      });
    }
  },
};

/**
 * Web environment mock - simulates standard web browser
 */
export const webEnvironment: MockEnvironment = {
  type: 'web' as const,

  setup() {
    // Store original values
    originalGlobals.electronAPI = (globalThis as any).electronAPI;
    originalGlobals.Capacitor = (globalThis as any).Capacitor;
    originalGlobals.window = globalThis.window;
    originalGlobals.navigator = globalThis.navigator;

    // Remove platform-specific APIs
    delete (globalThis as any).electronAPI;
    delete (globalThis as any).Capacitor;

    // Mock basic web window object
    if (!globalThis.window) {
      Object.defineProperty(globalThis, 'window', {
        value: {
          location: { origin: 'https://localhost:3000' },
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        writable: true,
        configurable: true,
      });
    } else {
      // Remove platform APIs from existing window
      delete (globalThis.window as any).electronAPI;
      delete (globalThis.window as any).Capacitor;
    }

    // Mock navigator for web environment
    if (!globalThis.navigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          platform: 'MacIntel',
          language: 'en-US',
          onLine: true,
        },
        writable: true,
        configurable: true,
      });
    }
  },

  cleanup() {
    // Restore original values
    if (originalGlobals.electronAPI !== undefined) {
      (globalThis as any).electronAPI = originalGlobals.electronAPI;
    }

    if (originalGlobals.Capacitor !== undefined) {
      (globalThis as any).Capacitor = originalGlobals.Capacitor;
    }

    if (originalGlobals.window !== undefined) {
      globalThis.window = originalGlobals.window as Window & typeof globalThis;
    }

    if (originalGlobals.navigator !== undefined) {
      globalThis.navigator = originalGlobals.navigator as Navigator;
    }
  },

  reset() {
    // No mock functions to reset in pure web environment
  },
};

/**
 * Mixed environment mock - simulates environment with multiple platform APIs
 * Useful for testing edge cases and conflicts
 */
export const mixedEnvironment: MockEnvironment = {
  type: 'mixed' as const,

  setup() {
    // Setup both Electron and Capacitor simultaneously
    electronEnvironment.setup();
    capacitorEnvironment.setup();
  },

  cleanup() {
    electronEnvironment.cleanup();
    capacitorEnvironment.cleanup();
  },

  reset() {
    electronEnvironment.reset();
    capacitorEnvironment.reset();
  },
};

/**
 * Utility function to safely setup a mock environment with automatic cleanup
 * @param environment - The mock environment to setup
 * @returns Cleanup function that should be called in test teardown
 */
export const setupMockEnvironment = (environment: MockEnvironment): (() => void) => {
  environment.setup();
  return () => environment.cleanup();
};

/**
 * Test utility to temporarily switch to a different environment
 * @param environment - The environment to switch to
 * @param testFn - The test function to run in the environment
 */
export const withMockEnvironment = async <T>(
  environment: MockEnvironment,
  testFn: () => Promise<T> | T,
): Promise<T> => {
  const cleanup = setupMockEnvironment(environment);
  try {
    return await testFn();
  } finally {
    cleanup();
  }
};
