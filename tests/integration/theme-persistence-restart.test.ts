/**
 * Theme Persistence Across App Restarts Integration Tests
 *
 * Tests that theme changes persist correctly when simulating application
 * restarts by creating new store instances and verifying localStorage
 * hydration functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createThemeSlice } from '../../src/renderer/store/slices/theme';
import { createUISlice } from '../../src/renderer/store/slices/ui';
import { createSettingsSlice } from '../../src/renderer/store/slices/settings';
import { createAgentSlice } from '../../src/renderer/store/slices/agents';
import { createConversationSlice } from '../../src/renderer/store/slices/conversation';
import { storeConfig } from '../../src/renderer/store';
import type { Theme, AppState } from '../../src/renderer/store/types';

// Mock document.documentElement.setAttribute for theme application
const setAttributeMock = vi.fn();
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: setAttributeMock,
  writable: true,
});

// Mock window.matchMedia for system theme detection
const createMatchMediaMock = (matches: boolean) => {
  return vi.fn().mockImplementation(query => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

/**
 * Creates a new store instance to simulate app restart
 * This tests that the new store properly hydrates from localStorage
 */
const createNewStoreInstance = () => {
  return create<AppState>()(
    devtools(
      persist(
        immer((set, get, store) => ({
          // Combine all slices into a single store
          ...createThemeSlice(set, get, store),
          ...createUISlice(set, get, store),
          ...createSettingsSlice(set, get, store),
          ...createAgentSlice(set, get, store),
          ...createConversationSlice(set, get, store),
        })),
        {
          name: storeConfig.persist.name,
          version: storeConfig.persist.version,
          partialize: storeConfig.persist.partialize,
          // Handle storage errors gracefully
          onRehydrateStorage: () => {
            return (state, error) => {
              if (error) {
                console.error('Store rehydration error:', error);
                return;
              }
              if (state) {
                // Fix inconsistent theme state after hydration
                if (state.theme && state.theme !== 'system') {
                  // If theme is not 'system', effectiveTheme should match theme
                  if (!state.effectiveTheme || state.effectiveTheme !== state.theme) {
                    state.effectiveTheme = state.theme;
                  }
                } else if (state.theme === 'system') {
                  // If theme is 'system', effectiveTheme should match systemTheme
                  if (!state.effectiveTheme || !state.systemTheme) {
                    state.effectiveTheme = state.systemTheme || 'light';
                  }
                }
                console.warn('Store rehydrated successfully');
              }
            };
          },
        },
      ),
      {
        name: storeConfig.devtools.name,
        enabled: storeConfig.devtools.enabled,
      },
    ),
  );
};

/**
 * Waits for store hydration to complete
 */
const waitForHydration = async (store: ReturnType<typeof createNewStoreInstance>) => {
  return new Promise<void>(resolve => {
    // If already hydrated, resolve immediately
    if (store.persist.hasHydrated()) {
      resolve();
      return;
    }

    // Wait for hydration to complete
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
};

/**
 * Gets persisted theme data from localStorage
 */
const getPersistedThemeData = () => {
  const persistedData = localStorage.getItem(storeConfig.persist.name);
  if (persistedData) {
    const parsed = JSON.parse(persistedData);
    return {
      theme: parsed.state.theme,
      systemTheme: parsed.state.systemTheme,
      effectiveTheme: parsed.state.effectiveTheme,
    };
  }
  return null;
};

describe('Theme Persistence Across App Restarts', () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    // Reset DOM attribute mock
    setAttributeMock.mockClear();

    // Clear localStorage
    localStorage.clear();

    // Create fresh matchMedia mock (default to light system theme)
    matchMediaMock = createMatchMediaMock(false);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Theme Persistence', () => {
    it('should persist light theme across app restart', async () => {
      // Create initial store and set theme to light
      const initialStore = createNewStoreInstance();
      await waitForHydration(initialStore);
      const initialState = initialStore.getState();
      initialState.setTheme('light');

      // Get fresh state after theme update
      const updatedState = initialStore.getState();

      // Verify theme is set and persisted
      expect(updatedState.theme).toBe('light');
      expect(updatedState.effectiveTheme).toBe('light');
      const persistedData = getPersistedThemeData();
      expect(persistedData?.theme).toBe('light');
      expect(persistedData?.effectiveTheme).toBe('light');

      // Simulate app restart by creating new store instance
      const newStore = createNewStoreInstance();
      await waitForHydration(newStore);
      const newState = newStore.getState();

      // Verify theme is restored after restart
      expect(newState.theme).toBe('light');
      expect(newState.effectiveTheme).toBe('light');
    });

    it('should persist dark theme across app restart', () => {
      // Create initial store and set theme to dark
      const initialStore = createNewStoreInstance();
      const initialState = initialStore.getState();
      initialState.setTheme('dark');

      // Get fresh state after theme update
      const updatedState = initialStore.getState();

      // Verify theme is set and persisted
      expect(updatedState.theme).toBe('dark');
      expect(updatedState.effectiveTheme).toBe('dark');
      const persistedData = getPersistedThemeData();
      expect(persistedData?.theme).toBe('dark');
      expect(persistedData?.effectiveTheme).toBe('dark');

      // Simulate app restart by creating new store instance
      const newStore = createNewStoreInstance();
      const newState = newStore.getState();

      // Verify theme is restored after restart
      expect(newState.theme).toBe('dark');
      expect(newState.effectiveTheme).toBe('dark');
    });

    it('should persist system theme across app restart', () => {
      // Create initial store and set theme to system
      const initialStore = createNewStoreInstance();
      const initialState = initialStore.getState();
      initialState.setTheme('system');

      // Verify theme is set and persisted
      expect(initialState.theme).toBe('system');
      expect(initialState.effectiveTheme).toBe('light'); // Default system theme is light
      const persistedData = getPersistedThemeData();
      expect(persistedData?.theme).toBe('system');
      expect(persistedData?.effectiveTheme).toBe('light');

      // Simulate app restart by creating new store instance
      const newStore = createNewStoreInstance();
      const newState = newStore.getState();

      // Verify theme is restored after restart
      expect(newState.theme).toBe('system');
      expect(newState.effectiveTheme).toBe('light');
    });
  });

  describe('System Theme Persistence', () => {
    it('should persist system theme with dark system preference across app restart', () => {
      // Create initial store with dark system theme
      const initialStore = createNewStoreInstance();
      const initialState = initialStore.getState();
      initialState.updateSystemTheme('dark');
      initialState.setTheme('system');

      // Get fresh state after theme updates
      const updatedState = initialStore.getState();

      // Verify theme state
      expect(updatedState.theme).toBe('system');
      expect(updatedState.systemTheme).toBe('dark');
      expect(updatedState.effectiveTheme).toBe('dark');

      // Verify persistence
      const persistedData = getPersistedThemeData();
      expect(persistedData?.theme).toBe('system');
      expect(persistedData?.systemTheme).toBe('dark');
      expect(persistedData?.effectiveTheme).toBe('dark');

      // Simulate app restart by creating new store instance
      const newStore = createNewStoreInstance();
      const newState = newStore.getState();

      // Verify theme is restored after restart
      expect(newState.theme).toBe('system');
      expect(newState.systemTheme).toBe('dark');
      expect(newState.effectiveTheme).toBe('dark');
    });

    it('should restore system theme but allow new system detection after restart', () => {
      // Create initial store with light system theme
      const initialStore = createNewStoreInstance();
      const initialState = initialStore.getState();
      initialState.setTheme('system');

      // Verify initial state
      expect(initialState.theme).toBe('system');
      expect(initialState.systemTheme).toBe('light');
      expect(initialState.effectiveTheme).toBe('light');

      // Persist the state
      const persistedData = getPersistedThemeData();
      expect(persistedData?.theme).toBe('system');

      // Simulate app restart - the persisted systemTheme should be restored
      const newStore = createNewStoreInstance();
      const newState = newStore.getState();

      // Theme setting should be restored from persistence
      expect(newState.theme).toBe('system');
      // Note: systemTheme and effectiveTheme may be re-detected during initialization
      expect(['light', 'dark']).toContain(newState.effectiveTheme);
    });
  });

  describe('Multiple Theme Changes', () => {
    it('should persist final theme after multiple changes before restart', () => {
      // Create initial store and make multiple theme changes
      const initialStore = createNewStoreInstance();
      const initialState = initialStore.getState();

      initialState.setTheme('light');
      initialState.setTheme('dark');
      initialState.setTheme('system');
      initialState.setTheme('dark'); // Final theme

      // Get fresh state after theme updates
      const updatedState = initialStore.getState();

      // Verify final state
      expect(updatedState.theme).toBe('dark');
      expect(updatedState.effectiveTheme).toBe('dark');

      // Simulate app restart
      const newStore = createNewStoreInstance();
      const newState = newStore.getState();

      // Verify only final theme is restored
      expect(newState.theme).toBe('dark');
      expect(newState.effectiveTheme).toBe('dark');
    });

    it('should persist theme toggle results across app restart', () => {
      // Create initial store and toggle theme
      const initialStore = createNewStoreInstance();
      const initialState = initialStore.getState();

      // Start with light and toggle to dark
      initialState.setTheme('light');
      initialState.toggleTheme();

      // Get fresh state after theme updates
      const updatedState = initialStore.getState();

      // Verify toggle result
      expect(updatedState.theme).toBe('dark');
      expect(updatedState.effectiveTheme).toBe('dark');

      // Simulate app restart
      const newStore = createNewStoreInstance();
      const newState = newStore.getState();

      // Verify toggle result is restored
      expect(newState.theme).toBe('dark');
      expect(newState.effectiveTheme).toBe('dark');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should recover gracefully from corrupted theme data in localStorage', () => {
      // Corrupt localStorage data
      localStorage.setItem(storeConfig.persist.name, 'invalid-json');

      // Create new store (simulating app restart)
      const newStore = createNewStoreInstance();
      const state = newStore.getState();

      // Should recover with default theme values
      expect(state.theme).toBe('system'); // Default theme
      expect(['light', 'dark']).toContain(state.effectiveTheme);
    });

    it('should handle missing theme properties in localStorage', () => {
      // Set incomplete persisted data (missing effectiveTheme)
      const incompleteData = {
        state: {
          theme: 'dark',
          systemTheme: 'light',
          // missing effectiveTheme
        },
        version: 1,
      };
      localStorage.setItem(storeConfig.persist.name, JSON.stringify(incompleteData));

      // Create new store (simulating app restart)
      const newStore = createNewStoreInstance();
      const state = newStore.getState();

      // Should recover and set consistent state
      expect(state.theme).toBe('dark');
      expect(state.effectiveTheme).toBe('dark'); // Should be derived from theme
    });

    it('should handle version mismatch in localStorage gracefully', () => {
      // Set data with different version
      const versionMismatchData = {
        state: {
          theme: 'dark',
          systemTheme: 'light',
          effectiveTheme: 'dark',
        },
        version: 999, // Future version
      };
      localStorage.setItem(storeConfig.persist.name, JSON.stringify(versionMismatchData));

      // Create new store (simulating app restart)
      const newStore = createNewStoreInstance();
      const state = newStore.getState();

      // Should handle version mismatch gracefully
      expect(['light', 'dark', 'system']).toContain(state.theme);
      expect(['light', 'dark']).toContain(state.effectiveTheme);
    });
  });

  describe('Comprehensive Restart Scenarios', () => {
    it('should handle multiple sequential restarts with theme consistency', () => {
      // Set initial theme
      let store = createNewStoreInstance();
      let state = store.getState();
      state.setTheme('dark');

      // Multiple restart cycles
      for (let i = 0; i < 3; i++) {
        store = createNewStoreInstance();
        state = store.getState();
        expect(state.theme).toBe('dark');
        expect(state.effectiveTheme).toBe('dark');
      }
    });

    it('should persist different theme values across restarts', () => {
      const themes: Theme[] = ['light', 'dark', 'system'];

      themes.forEach(theme => {
        // Clear localStorage between themes
        localStorage.clear();

        // Set theme
        const initialStore = createNewStoreInstance();
        const initialState = initialStore.getState();
        initialState.setTheme(theme);

        // Simulate restart
        const newStore = createNewStoreInstance();
        const newState = newStore.getState();

        // Verify theme persisted through restart
        expect(newState.theme).toBe(theme);

        if (theme === 'system') {
          expect(['light', 'dark']).toContain(newState.effectiveTheme);
        } else {
          expect(newState.effectiveTheme).toBe(theme);
        }
      });
    });

    it('should maintain theme persistence with other UI state', () => {
      // Create initial store and set both theme and other UI state
      const initialStore = createNewStoreInstance();
      const initialState = initialStore.getState();

      initialState.setTheme('dark');
      initialState.setSidebarCollapsed(true);
      initialState.setWindowDimensions({ width: 1920, height: 1080 });

      // Simulate restart
      const newStore = createNewStoreInstance();
      const newState = newStore.getState();

      // Verify both theme and other UI state persisted
      expect(newState.theme).toBe('dark');
      expect(newState.effectiveTheme).toBe('dark');
      expect(newState.sidebarCollapsed).toBe(true);
      expect(newState.windowDimensions.width).toBe(1920);
      expect(newState.windowDimensions.height).toBe(1080);
    });
  });
});
