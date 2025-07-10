import { describe, it, expect, beforeEach, vi } from 'vitest';
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

/**
 * Integration tests for UI state persistence functionality
 *
 * These tests validate that UI state persists correctly across app restarts
 * and handles edge cases like corrupted localStorage data.
 */

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

describe('UI State Persistence Integration', () => {
  const STORAGE_KEY = 'fishbowl-store';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Clear any mocks
    vi.clearAllMocks();
  });

  describe('Persistent UI State', () => {
    it('should persist sidebar collapsed state across app restarts', async () => {
      // Create initial store instance
      const store1 = createNewStoreInstance();
      await waitForHydration(store1);

      // Initial state - sidebar not collapsed
      expect(store1.getState().sidebarCollapsed).toBe(false);

      // Toggle sidebar to collapsed
      store1.getState().setSidebarCollapsed(true);
      expect(store1.getState().sidebarCollapsed).toBe(true);

      // Verify persistence in localStorage
      const persistedData = localStorage.getItem(STORAGE_KEY);
      expect(persistedData).toBeTruthy();

      const parsedData = JSON.parse(persistedData!);
      expect(parsedData.state.sidebarCollapsed).toBe(true);

      // Simulate app restart by creating new store instance
      const store2 = createNewStoreInstance();
      await waitForHydration(store2);

      // The new store should automatically rehydrate from localStorage
      expect(store2.getState().sidebarCollapsed).toBe(true);
    });

    it('should persist window dimensions across app restarts', async () => {
      const testDimensions = { width: 1920, height: 1080 };

      // Create initial store instance
      const store1 = createNewStoreInstance();
      await waitForHydration(store1);

      // Set window dimensions
      store1.getState().setWindowDimensions(testDimensions);
      expect(store1.getState().windowDimensions).toEqual(testDimensions);

      // Verify localStorage contains the dimensions
      const persistedData = localStorage.getItem(STORAGE_KEY);
      const parsedData = JSON.parse(persistedData!);
      expect(parsedData.state.windowDimensions).toEqual(testDimensions);

      // Simulate app restart and verify dimensions are restored
      const store2 = createNewStoreInstance();
      await waitForHydration(store2);
      expect(store2.getState().windowDimensions).toEqual(testDimensions);
    });

    it('should persist layout preferences across app restarts', async () => {
      const testPreferences = {
        sidebarWidth: 300,
        mainContentHeight: 800,
      };

      // Create initial store instance
      const store1 = createNewStoreInstance();
      await waitForHydration(store1);

      // Set layout preferences
      store1.getState().setLayoutPreferences(testPreferences);
      expect(store1.getState().layoutPreferences).toEqual(testPreferences);

      // Verify localStorage contains the preferences
      const persistedData = localStorage.getItem(STORAGE_KEY);
      const parsedData = JSON.parse(persistedData!);
      expect(parsedData.state.layoutPreferences).toEqual(testPreferences);

      // Simulate app restart and verify preferences are restored
      const store2 = createNewStoreInstance();
      await waitForHydration(store2);
      expect(store2.getState().layoutPreferences).toEqual(testPreferences);
    });
  });

  describe('Non-Persistent UI State', () => {
    it('should NOT persist activeModal state across app restarts', async () => {
      // Create initial store instance
      const store1 = createNewStoreInstance();
      await waitForHydration(store1);

      // Set active modal
      store1.getState().setActiveModal('settings');
      expect(store1.getState().activeModal).toBe('settings');

      // Verify localStorage does NOT contain activeModal
      const persistedData = localStorage.getItem(STORAGE_KEY);
      const parsedData = JSON.parse(persistedData!);
      expect(parsedData.state.activeModal).toBeUndefined();

      // Simulate app restart and verify activeModal is reset to null
      const store2 = createNewStoreInstance();
      await waitForHydration(store2);
      expect(store2.getState().activeModal).toBe(null);
    });
  });

  describe('localStorage Integration', () => {
    it('should store UI state in correct localStorage structure', async () => {
      // Create store instance
      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Set various UI state values
      store.getState().setSidebarCollapsed(true);
      store.getState().setWindowDimensions({ width: 1600, height: 900 });
      store.getState().setLayoutPreferences({ sidebarWidth: 280, mainContentHeight: 750 });

      // Check localStorage structure
      const persistedData = localStorage.getItem(STORAGE_KEY);
      expect(persistedData).toBeTruthy();

      const parsedData = JSON.parse(persistedData!);

      // Verify structure
      expect(parsedData).toHaveProperty('state');
      expect(parsedData).toHaveProperty('version', 1);

      // Verify UI state is included
      expect(parsedData.state.sidebarCollapsed).toBe(true);
      expect(parsedData.state.windowDimensions).toEqual({ width: 1600, height: 900 });
      expect(parsedData.state.layoutPreferences).toEqual({
        sidebarWidth: 280,
        mainContentHeight: 750,
      });

      // Verify activeModal is NOT included
      expect(parsedData.state.activeModal).toBeUndefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      // Set corrupted data in localStorage
      localStorage.setItem(STORAGE_KEY, 'invalid-json');

      // Store should initialize with defaults
      const store = createNewStoreInstance();

      // Use a race condition to handle potential timeout
      const hydrationTimeout = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Hydration timeout')), 1000);
      });

      try {
        await Promise.race([waitForHydration(store), hydrationTimeout]);
      } catch {
        // If hydration times out, that's expected with corrupted data
        // The store should still be usable with defaults
      }

      // Should use default values regardless of hydration success
      expect(store.getState().sidebarCollapsed).toBe(false);
      expect(store.getState().windowDimensions).toEqual({ width: 1200, height: 800 });
      expect(store.getState().layoutPreferences).toEqual({
        sidebarWidth: 280,
        mainContentHeight: 600,
      });
      expect(store.getState().activeModal).toBe(null);
    }, 2000);

    it('should handle missing fields in persisted data', async () => {
      // Set incomplete data in localStorage
      const incompleteData = {
        state: {
          sidebarCollapsed: true,
          // Missing windowDimensions and layoutPreferences
        },
        version: 1,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incompleteData));

      const store = createNewStoreInstance();
      await waitForHydration(store);

      // Should restore available fields and use defaults for missing ones
      expect(store.getState().sidebarCollapsed).toBe(true);
      expect(store.getState().windowDimensions).toEqual({ width: 1200, height: 800 }); // Default
      expect(store.getState().layoutPreferences).toEqual({
        sidebarWidth: 280,
        mainContentHeight: 600,
      }); // Default
    });
  });

  describe('Integration with Other Store Slices', () => {
    it('should persist UI state alongside theme and settings data', async () => {
      // Create store instance
      const store1 = createNewStoreInstance();
      await waitForHydration(store1);

      // Set data across multiple slices
      store1.getState().setTheme('dark' as Theme);
      store1.getState().setSidebarCollapsed(true);
      store1.getState().setPreferences({ enableNotifications: true });
      store1.getState().setLayoutPreferences({ sidebarWidth: 300, mainContentHeight: 700 });

      // Verify all data is persisted together
      const persistedData = localStorage.getItem(STORAGE_KEY);
      const parsedData = JSON.parse(persistedData!);

      expect(parsedData.state.theme).toBe('dark');
      expect(parsedData.state.sidebarCollapsed).toBe(true);
      expect(parsedData.state.preferences.enableNotifications).toBe(true);
      expect(parsedData.state.layoutPreferences).toEqual({
        sidebarWidth: 300,
        mainContentHeight: 700,
      });

      // Simulate app restart and verify all data is restored
      const store2 = createNewStoreInstance();
      await waitForHydration(store2);

      expect(store2.getState().theme).toBe('dark');
      expect(store2.getState().sidebarCollapsed).toBe(true);
      expect(store2.getState().preferences.enableNotifications).toBe(true);
      expect(store2.getState().layoutPreferences).toEqual({
        sidebarWidth: 300,
        mainContentHeight: 700,
      });
    });
  });
});
