/**
 * Core Zustand store configuration with middleware stack
 *
 * This file sets up the main application store with:
 * - Immer middleware for immutable state updates
 * - Persistence middleware for selective localStorage storage
 * - DevTools middleware for debugging (development only)
 * - Comprehensive TypeScript typing
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {} from '@redux-devtools/extension';

import type { AppState, StoreConfig } from './types';
import { createThemeSlice } from './slices/theme';
import { createUISlice } from './slices/ui';
import { createSettingsSlice } from './slices/settings';
import { createAgentSlice } from './slices/agents';
import { createConversationSlice } from './slices/conversation';
import { systemThemeDetector, getCurrentSystemTheme } from './utils';

/**
 * Default values for store initialization
 */
const defaultTheme = 'system' as const;
const defaultSidebarCollapsed = false;
const defaultWindowDimensions = { width: 1200, height: 800 };

/**
 * Store configuration
 */
const storeConfig: StoreConfig = {
  persist: {
    name: 'fishbowl-store',
    version: 1,
    // Only persist UI-related slices, not sensitive data
    partialize: state => ({
      theme: state.theme,
      systemTheme: state.systemTheme,
      effectiveTheme: state.effectiveTheme,
      sidebarCollapsed: state.sidebarCollapsed,
      windowDimensions: state.windowDimensions,
      layoutPreferences: state.layoutPreferences,
      preferences: state.preferences,
      configuration: state.configuration,
    }),
  },
  devtools: {
    name: 'Fishbowl Store',
    enabled: process.env.NODE_ENV === 'development',
    trace: true,
    traceLimit: 25,
  },
};

/**
 * Create the combined store with all slices
 */
export const useStore = create<AppState>()(
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
        // Validate and migrate persisted state
        migrate: (persistedState: unknown, version: number) => {
          if (version === 0) {
            // Migration from version 0 to 1
            console.warn('Migrating store from version 0 to 1');
          }
          return persistedState as AppState;
        },
        // Skip hydration on server-side rendering
        skipHydration: false,
        // Handle storage errors gracefully
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.error('Store rehydration error:', error);
              // Reset to default state on error
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
      enabled: storeConfig.devtools.enabled,
      trace: storeConfig.devtools.trace,
      traceLimit: storeConfig.devtools.traceLimit,
    },
  ),
);

/**
 * Export store type for testing and external use
 */
export type Store = typeof useStore;

/**
 * Export store configuration for reference
 */
export { storeConfig };

/**
 * Utility function to get store state (for testing)
 */
export const getStoreState = () => useStore.getState();

/**
 * Utility function to reset store to defaults
 */
export const resetStore = () => {
  const state = useStore.getState();

  // Reset theme to default
  state.setTheme(defaultTheme);

  // Reset UI state
  state.setSidebarCollapsed(defaultSidebarCollapsed);
  state.setWindowDimensions(defaultWindowDimensions);
  state.setActiveModal(null);

  // Reset settings to defaults
  state.resetSettings();

  // Clear data slices
  state.setAgents([]);
  state.setActiveAgents([]);
  state.setConversations([]);
  state.setActiveConversation(null);

  // Clear errors
  state.setError(null);

  console.warn('Store reset to default state');
};

/**
 * Cleanup store resources (call on app shutdown)
 */
export const cleanupStore = (): void => {
  try {
    // Stop system theme detection
    systemThemeDetector.stopListening();

    console.warn('Store cleanup completed');
  } catch (error) {
    console.error('Store cleanup error:', error);
  }
};

/**
 * Utility function to validate store state
 */
export const validateStoreState = (): boolean => {
  try {
    const state = useStore.getState();

    // Validate theme
    if (!['light', 'dark', 'system'].includes(state.theme)) {
      console.error('Invalid theme in store state');
      return false;
    }

    // Validate window dimensions
    if (
      !state.windowDimensions ||
      typeof state.windowDimensions.width !== 'number' ||
      typeof state.windowDimensions.height !== 'number'
    ) {
      console.error('Invalid window dimensions in store state');
      return false;
    }

    // Validate arrays
    if (!Array.isArray(state.agents) || !Array.isArray(state.conversations)) {
      console.error('Invalid array data in store state');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Store state validation error:', error);
    return false;
  }
};

/**
 * Initialize store with validation
 */
export const initializeStore = (): boolean => {
  try {
    // Validate initial state
    if (!validateStoreState()) {
      console.warn('Store state validation failed, resetting to defaults');
      resetStore();
    }

    // Set up system theme detection
    const state = useStore.getState();

    // Start system theme detection
    const success = systemThemeDetector.startListening((isDark: boolean) => {
      state.updateSystemTheme(isDark ? 'dark' : 'light');
    });

    if (!success) {
      // Fallback: try to detect current system theme once
      const fallbackTheme = getCurrentSystemTheme();
      state.updateSystemTheme(fallbackTheme);
      console.warn('System theme listener setup failed, using fallback detection');
    }

    console.warn('Store initialized successfully');
    return true;
  } catch (error) {
    console.error('Store initialization error:', error);
    return false;
  }
};
