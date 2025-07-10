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
import type { AppState } from '../../src/renderer/store/types';

/**
 * Creates a new store instance to simulate app restart
 * This tests that the new store properly hydrates from localStorage
 */
const createNewStoreInstance = () => {
  return create<AppState>()(
    devtools(
      persist(
        immer((set, get, store) => ({
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
          skipHydration: false,
          onRehydrateStorage: () => {
            return (state, error) => {
              if (error) {
                console.error('Store rehydration error:', error);
                return;
              }
              if (state) {
                console.warn('Store rehydrated successfully');
              }
            };
          },
        },
      ),
      {
        name: storeConfig.devtools.name,
        enabled: false, // Disable devtools in tests
      },
    ),
  );
};

// Mock document.documentElement.setAttribute for theme application
const setAttributeMock = vi.fn();
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: setAttributeMock,
  writable: true,
});

describe('Settings State Persistence Integration Tests', () => {
  let localStorage: Storage;

  beforeEach(() => {
    // Mock localStorage with real functionality
    const storage = new Map<string, string>();
    localStorage = {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        storage.delete(key);
      }),
      clear: vi.fn(() => {
        storage.clear();
      }),
      get length() {
        return storage.size;
      },
      key: vi.fn((index: number) => {
        return Array.from(storage.keys())[index] || null;
      }),
    };

    // Replace global localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Basic Settings Persistence', () => {
    it('should persist preferences across app restart', () => {
      // Create initial store
      const store1 = createNewStoreInstance();

      // Update preferences
      store1.getState().setPreferences({
        autoSave: false,
        defaultProvider: 'anthropic',
        maxConversationHistory: 150,
        enableNotifications: false,
      });

      // Verify changes in current store
      const preferences1 = store1.getState().preferences;
      expect(preferences1.autoSave).toBe(false);
      expect(preferences1.defaultProvider).toBe('anthropic');
      expect(preferences1.maxConversationHistory).toBe(150);
      expect(preferences1.enableNotifications).toBe(false);

      // Simulate app restart with new store
      const store2 = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      // Verify preferences persisted
      const preferences2 = store2.getState().preferences;
      expect(preferences2.autoSave).toBe(false);
      expect(preferences2.defaultProvider).toBe('anthropic');
      expect(preferences2.maxConversationHistory).toBe(150);
      expect(preferences2.enableNotifications).toBe(false);
    });

    it('should persist configuration across app restart', () => {
      // Create initial store
      const store1 = createNewStoreInstance();

      // Update configuration
      store1.getState().setConfiguration({
        debugMode: true,
        performanceMode: true,
        experimentalFeatures: true,
      });

      // Verify changes in current store
      const config1 = store1.getState().configuration;
      expect(config1.debugMode).toBe(true);
      expect(config1.performanceMode).toBe(true);
      expect(config1.experimentalFeatures).toBe(true);

      // Simulate app restart with new store
      const store2 = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      // Verify configuration persisted
      const config2 = store2.getState().configuration;
      expect(config2.debugMode).toBe(true);
      expect(config2.performanceMode).toBe(true);
      expect(config2.experimentalFeatures).toBe(true);
    });

    it('should persist both preferences and configuration together', () => {
      // Create initial store
      const store1 = createNewStoreInstance();

      // Update both preferences and configuration
      store1.getState().setPreferences({
        autoSave: false,
        maxConversationHistory: 200,
      });

      store1.getState().setConfiguration({
        debugMode: true,
        experimentalFeatures: true,
      });

      // Simulate app restart
      const store2 = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      // Verify both persisted correctly
      const state2 = store2.getState();
      expect(state2.preferences.autoSave).toBe(false);
      expect(state2.preferences.maxConversationHistory).toBe(200);
      expect(state2.configuration.debugMode).toBe(true);
      expect(state2.configuration.experimentalFeatures).toBe(true);
    });

    it('should persist reset settings', () => {
      // Create initial store
      const store1 = createNewStoreInstance();

      // Change settings then reset
      store1.getState().setPreferences({ autoSave: false });
      store1.getState().setConfiguration({ debugMode: true });
      store1.getState().resetSettings();

      // Verify reset in current store
      const state1 = store1.getState();
      expect(state1.preferences.autoSave).toBe(true); // default
      expect(state1.configuration.debugMode).toBe(false); // default

      // Simulate app restart
      const store2 = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      // Verify reset persisted
      const state2 = store2.getState();
      expect(state2.preferences.autoSave).toBe(true);
      expect(state2.configuration.debugMode).toBe(false);
    });
  });

  describe('Complex Update Scenarios', () => {
    it('should persist multiple sequential updates', () => {
      const store1 = createNewStoreInstance();

      // Multiple updates
      store1.getState().setPreferences({ autoSave: false });
      store1.getState().setPreferences({ defaultProvider: 'google' });
      store1.getState().setPreferences({ maxConversationHistory: 300 });
      store1.getState().setConfiguration({ debugMode: true });
      store1.getState().setConfiguration({ performanceMode: true });

      // Simulate app restart
      const store2 = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      // Verify all updates persisted
      const state2 = store2.getState();
      expect(state2.preferences.autoSave).toBe(false);
      expect(state2.preferences.defaultProvider).toBe('google');
      expect(state2.preferences.maxConversationHistory).toBe(300);
      expect(state2.configuration.debugMode).toBe(true);
      expect(state2.configuration.performanceMode).toBe(true);
    });

    it('should handle partial updates correctly', () => {
      const store1 = createNewStoreInstance();

      // Set initial values
      store1.getState().setPreferences({
        autoSave: false,
        defaultProvider: 'anthropic',
        maxConversationHistory: 200,
        enableNotifications: false,
      });

      // Partial update
      store1.getState().setPreferences({
        autoSave: true, // Only update this
      });

      // Simulate app restart
      const store2 = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      // Verify partial update persisted correctly
      const prefs2 = store2.getState().preferences;
      expect(prefs2.autoSave).toBe(true); // Updated
      expect(prefs2.defaultProvider).toBe('anthropic'); // Unchanged
      expect(prefs2.maxConversationHistory).toBe(200); // Unchanged
      expect(prefs2.enableNotifications).toBe(false); // Unchanged
    });

    it('should persist settings across multiple restarts', () => {
      // First session
      const store1 = createNewStoreInstance();
      store1.getState().setPreferences({ autoSave: false });

      // Second session
      const store2 = createNewStoreInstance();
      const unsubscribe2 = store2.subscribe(() => {});
      unsubscribe2();
      expect(store2.getState().preferences.autoSave).toBe(false);
      store2.getState().setPreferences({ defaultProvider: 'groq' });

      // Third session
      const store3 = createNewStoreInstance();
      const unsubscribe3 = store3.subscribe(() => {});
      unsubscribe3();
      expect(store3.getState().preferences.autoSave).toBe(false);
      expect(store3.getState().preferences.defaultProvider).toBe('groq');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle corrupted localStorage data', () => {
      // Set corrupted data
      localStorage.setItem('fishbowl-store', '{ invalid json }');

      // Create store - should handle gracefully
      const store = createNewStoreInstance();

      // Wait for hydration attempt
      const unsubscribe = store.subscribe(() => {});
      unsubscribe();

      // Should fall back to defaults
      const state = store.getState();
      expect(state.preferences.autoSave).toBe(true); // default
      expect(state.preferences.defaultProvider).toBe('openai'); // default
      expect(state.configuration.debugMode).toBe(false); // default
    });

    it('should handle missing fields in persisted data', () => {
      // Set partial data missing some fields
      const partialData = {
        state: {
          preferences: {
            autoSave: false,
            // Missing other fields
          },
          configuration: {
            debugMode: true,
            // Missing other fields
          },
        },
        version: 1,
      };
      localStorage.setItem('fishbowl-store', JSON.stringify(partialData));

      // Create store
      const store = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store.subscribe(() => {});
      unsubscribe();

      // Partial data is kept as-is, missing fields will be undefined
      const state = store.getState();
      expect(state.preferences.autoSave).toBe(false); // From storage
      expect(state.preferences.defaultProvider).toBeUndefined(); // Missing field
      expect(state.preferences.maxConversationHistory).toBeUndefined(); // Missing field
      expect(state.configuration.debugMode).toBe(true); // From storage
      expect(state.configuration.performanceMode).toBeUndefined(); // Missing field
    });

    it('should handle version mismatches', () => {
      // Set data with different version
      const oldVersionData = {
        state: {
          preferences: { autoSave: false },
          configuration: { debugMode: true },
        },
        version: 999, // Different version
      };
      localStorage.setItem('fishbowl-store', JSON.stringify(oldVersionData));

      // Create store
      const store = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store.subscribe(() => {});
      unsubscribe();

      // Version mismatch causes migration warning, but since no migrate function
      // is provided, it falls back to initial state
      const state = store.getState();
      // Check defaults are applied (version mismatch rejected the data)
      expect(state.preferences.autoSave).toBe(true); // default
      expect(state.preferences.defaultProvider).toBe('openai'); // default
      expect(state.configuration.debugMode).toBe(false); // default
    });

    it('should handle invalid data types', () => {
      // Set data with wrong types
      const invalidData = {
        state: {
          preferences: {
            autoSave: 'yes', // Should be boolean
            defaultProvider: 123, // Should be string
            maxConversationHistory: 'many', // Should be number
            enableNotifications: null, // Should be boolean
          },
          configuration: {
            debugMode: 1, // Should be boolean
            performanceMode: 'fast', // Should be boolean
            experimentalFeatures: {}, // Should be boolean
          },
        },
        version: 1,
      };
      localStorage.setItem('fishbowl-store', JSON.stringify(invalidData));

      // Create store
      const store = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store.subscribe(() => {});
      unsubscribe();

      // Zustand persist actually keeps the invalid values, not falling back to defaults
      // This is different from corrupted JSON which fails to parse entirely
      const state = store.getState();
      expect(state.preferences.autoSave).toBe('yes'); // Invalid string kept
      expect(state.preferences.defaultProvider).toBe(123); // Invalid number kept
      expect(state.preferences.maxConversationHistory).toBe('many'); // Invalid string kept
      expect(state.configuration.debugMode).toBe(1); // Invalid number kept
    });
  });

  describe('localStorage Integration', () => {
    it('should store settings in correct localStorage structure', async () => {
      const store = createNewStoreInstance();

      // Update settings
      store.getState().setPreferences({ autoSave: false });
      store.getState().setConfiguration({ debugMode: true });

      // Wait a bit for persistence to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check localStorage structure
      const stored = localStorage.getItem('fishbowl-store');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveProperty('state');
      expect(parsed).toHaveProperty('version');
      expect(parsed.state).toHaveProperty('preferences');
      expect(parsed.state).toHaveProperty('configuration');
      expect(parsed.state.preferences.autoSave).toBe(false);
      expect(parsed.state.configuration.debugMode).toBe(true);
    });

    it('should only persist settings-related state', async () => {
      const store = createNewStoreInstance();

      // Update various states
      store.getState().setPreferences({ autoSave: false });
      store.getState().setConfiguration({ debugMode: true });
      store.getState().setTheme('dark');
      store.getState().setActiveModal('settings');
      store.getState().addAgent({
        id: '123',
        name: 'Test Agent',
        role: 'assistant',
        personality: 'helpful',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Wait a bit for persistence to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Check what's persisted
      const stored = localStorage.getItem('fishbowl-store');
      expect(stored).toBeTruthy(); // Ensure something was stored

      const parsed = JSON.parse(stored!);

      // Settings should be persisted
      expect(parsed.state.preferences).toBeDefined();
      expect(parsed.state.configuration).toBeDefined();

      // Theme and UI state (except activeModal) should be persisted
      expect(parsed.state.theme).toBeDefined();
      expect(parsed.state.activeModal).toBeUndefined(); // activeModal is not persisted

      // Agents should NOT be persisted
      expect(parsed.state.agents).toBeUndefined();
    });
  });

  describe('Cross-Slice Integration', () => {
    it('should persist settings alongside theme and UI state', () => {
      const store1 = createNewStoreInstance();

      // Update multiple slices
      store1.getState().setPreferences({ autoSave: false });
      store1.getState().setConfiguration({ debugMode: true });
      store1.getState().setTheme('dark');
      store1.getState().setSidebarCollapsed(true);
      store1.getState().setWindowDimensions({ width: 1920, height: 1080 });

      // Simulate app restart
      const store2 = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      // Verify all states persisted correctly
      const state2 = store2.getState();
      expect(state2.preferences.autoSave).toBe(false);
      expect(state2.configuration.debugMode).toBe(true);
      expect(state2.theme).toBe('dark');
      expect(state2.sidebarCollapsed).toBe(true);
      expect(state2.windowDimensions.width).toBe(1920);
    });

    it('should handle selective state updates across slices', () => {
      const store1 = createNewStoreInstance();

      // Set initial state
      store1.getState().setPreferences({ autoSave: false });
      store1.getState().setTheme('dark');

      // Update only settings
      store1.getState().setConfiguration({ performanceMode: true });

      // Simulate app restart
      const store2 = createNewStoreInstance();

      // Wait for hydration
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      // All states should persist correctly
      const state2 = store2.getState();
      expect(state2.preferences.autoSave).toBe(false);
      expect(state2.configuration.performanceMode).toBe(true);
      expect(state2.theme).toBe('dark');
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary values for numeric settings', () => {
      const store1 = createNewStoreInstance();

      // Test boundary values
      const testCases = [0, 1, 999, 1000, Number.MAX_SAFE_INTEGER];

      for (const value of testCases) {
        store1.getState().setPreferences({ maxConversationHistory: value });

        // Simulate restart
        const store2 = createNewStoreInstance();
        const unsubscribe = store2.subscribe(() => {});
        unsubscribe();

        expect(store2.getState().preferences.maxConversationHistory).toBe(value);
      }
    });

    it('should handle rapid sequential updates before restart', () => {
      const store1 = createNewStoreInstance();

      // Rapid updates
      for (let i = 0; i < 10; i++) {
        store1.getState().setPreferences({ maxConversationHistory: i * 10 });
      }

      // Final value should persist
      const store2 = createNewStoreInstance();
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      expect(store2.getState().preferences.maxConversationHistory).toBe(90);
    });

    it('should handle empty preference updates', () => {
      const store1 = createNewStoreInstance();

      // Set initial state
      store1.getState().setPreferences({
        autoSave: false,
        defaultProvider: 'anthropic',
      });

      // Empty update
      store1.getState().setPreferences({});

      // Simulate restart
      const store2 = createNewStoreInstance();
      const unsubscribe = store2.subscribe(() => {});
      unsubscribe();

      // Original values should persist
      const prefs2 = store2.getState().preferences;
      expect(prefs2.autoSave).toBe(false);
      expect(prefs2.defaultProvider).toBe('anthropic');
    });

    it('should handle provider name changes', () => {
      const store1 = createNewStoreInstance();

      // Test various provider names
      const providers = ['openai', 'anthropic', 'google', 'groq', 'custom-provider'];

      for (const provider of providers) {
        store1.getState().setPreferences({ defaultProvider: provider });

        // Simulate restart
        const store2 = createNewStoreInstance();
        const unsubscribe = store2.subscribe(() => {});
        unsubscribe();

        expect(store2.getState().preferences.defaultProvider).toBe(provider);
      }
    });
  });
});
