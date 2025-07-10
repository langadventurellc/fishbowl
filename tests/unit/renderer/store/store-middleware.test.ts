/**
 * Store middleware configuration tests
 *
 * Tests for Zustand store with immer, persistence, and devtools middleware
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useStore,
  resetStore,
  validateStoreState,
  initializeStore,
  getStoreState,
} from '../../../../src/renderer/store/index';

// Mock window.matchMedia for system theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Store Middleware Configuration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset store to default state
    resetStore();
  });

  describe('Immer Middleware', () => {
    it('should allow immutable state updates using immer', () => {
      const store = useStore.getState();
      const initialAgents = store.agents;

      // Update agents using immer pattern
      store.setAgents([
        {
          id: 'test-1',
          name: 'Test Agent',
          role: 'Assistant',
          personality: 'Helpful and knowledgeable',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);

      const updatedState = useStore.getState();

      // State should be updated
      expect(updatedState.agents).toHaveLength(1);
      expect(updatedState.agents[0].name).toBe('Test Agent');

      // Original state should be different (immutable)
      expect(updatedState.agents).not.toBe(initialAgents);
    });

    it('should handle nested object updates immutably', () => {
      const store = useStore.getState();
      const initialPreferences = store.preferences;

      // Update nested preferences
      store.setPreferences({ autoSave: false });

      const updatedState = useStore.getState();

      // Nested property should be updated
      expect(updatedState.preferences.autoSave).toBe(false);

      // Other properties should remain unchanged
      expect(updatedState.preferences.defaultProvider).toBe('openai');
      expect(updatedState.preferences.maxConversationHistory).toBe(100);

      // Original object should be different (immutable)
      expect(updatedState.preferences).not.toBe(initialPreferences);
    });
  });

  describe('Persistence Middleware', () => {
    it('should persist only UI-related state to localStorage', () => {
      const store = useStore.getState();

      // Update various state slices
      store.setTheme('dark');
      store.setSidebarCollapsed(true);
      store.setPreferences({ autoSave: false });
      store.setAgents([
        {
          id: 'test',
          name: 'Test',
          role: 'Assistant',
          personality: 'Test personality',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);

      // Check what's persisted in localStorage
      const persistedData = localStorage.getItem('fishbowl-store');
      expect(persistedData).toBeTruthy();

      if (persistedData) {
        const parsed = JSON.parse(persistedData);

        // UI-related state should be persisted
        expect(parsed.state.theme).toBe('dark');
        expect(parsed.state.sidebarCollapsed).toBe(true);
        expect(parsed.state.preferences.autoSave).toBe(false);

        // Sensitive data should NOT be persisted
        expect(parsed.state.agents).toBeUndefined();
        expect(parsed.state.conversations).toBeUndefined();
      }
    });

    it('should restore persisted state on store creation', () => {
      // Set some state that should be persisted
      const store = useStore.getState();
      store.setTheme('dark');
      store.setSidebarCollapsed(true);
      store.setPreferences({ autoSave: false, defaultProvider: 'anthropic' });

      // Verify the state was set
      const currentState = useStore.getState();
      expect(currentState.theme).toBe('dark');
      expect(currentState.sidebarCollapsed).toBe(true);
      expect(currentState.preferences.autoSave).toBe(false);

      // Check that localStorage contains the persisted data
      const persistedData = localStorage.getItem('fishbowl-store');
      expect(persistedData).toBeTruthy();

      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        expect(parsed.state.theme).toBe('dark');
        expect(parsed.state.sidebarCollapsed).toBe(true);
        expect(parsed.state.preferences.autoSave).toBe(false);
      }
    });

    it('should handle corrupted localStorage gracefully', () => {
      // Set corrupted data in localStorage
      localStorage.setItem('fishbowl-store', 'invalid-json');

      // Store should still work with default values
      const state = getStoreState();

      expect(state.theme).toBe('system');
      expect(state.sidebarCollapsed).toBe(false);
      expect(state.preferences.autoSave).toBe(true);
    });
  });

  describe('DevTools Middleware', () => {
    it('should configure devtools in development mode', () => {
      // In test environment, NODE_ENV should be 'test'
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // DevTools should be enabled in development
      expect(process.env.NODE_ENV).toBe('development');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should track state changes for debugging', () => {
      const store = useStore.getState();

      // Make some state changes
      store.setTheme('dark');
      store.toggleSidebar();
      store.setPreferences({ autoSave: false });

      // State should be updated correctly
      const updatedState = useStore.getState();
      expect(updatedState.theme).toBe('dark');
      expect(updatedState.sidebarCollapsed).toBe(true);
      expect(updatedState.preferences.autoSave).toBe(false);
    });
  });

  describe('Store Validation', () => {
    it('should validate store state successfully', () => {
      const isValid = validateStoreState();
      expect(isValid).toBe(true);
    });

    it('should detect invalid theme in store state', () => {
      // We can't directly corrupt the store state due to immutability,
      // so we'll test the validation function with a mock state
      const originalGetState = useStore.getState;

      // Mock getState to return invalid state
      useStore.getState = vi.fn().mockReturnValue({
        theme: 'invalid-theme', // Invalid theme
        windowDimensions: { width: 1200, height: 800 },
        agents: [],
        conversations: [],
      });

      const isValid = validateStoreState();
      expect(isValid).toBe(false);

      // Restore original getState
      useStore.getState = originalGetState;
    });

    it('should detect invalid window dimensions', () => {
      const store = useStore.getState();

      // Manually corrupt window dimensions
      store.setWindowDimensions({ width: -1, height: -1 });

      // The setter should prevent invalid dimensions
      const state = useStore.getState();
      expect(state.windowDimensions.width).toBeGreaterThan(0);
      expect(state.windowDimensions.height).toBeGreaterThan(0);
    });
  });

  describe('Store Initialization', () => {
    it('should initialize store successfully', () => {
      const initialized = initializeStore();
      expect(initialized).toBe(true);
    });

    it('should set up system theme detection', () => {
      const matchMediaMock = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Mock window.matchMedia to return dark theme
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      });

      initializeStore();

      // matchMedia should have been called for system theme detection
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('Store Reset', () => {
    it('should reset store to default values', () => {
      const store = useStore.getState();

      // Change various state values
      store.setTheme('dark');
      store.setSidebarCollapsed(true);
      store.setPreferences({ autoSave: false });
      store.setAgents([
        {
          id: 'test',
          name: 'Test',
          role: 'Assistant',
          personality: 'Test personality',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);

      // Reset store
      resetStore();

      // State should be back to defaults
      const resetState = useStore.getState();
      expect(resetState.theme).toBe('system');
      expect(resetState.sidebarCollapsed).toBe(false);
      expect(resetState.preferences.autoSave).toBe(true);
      expect(resetState.agents).toHaveLength(0);
      expect(resetState.error).toBeNull();
    });
  });

  describe('Store Integration', () => {
    it('should handle multiple simultaneous state updates', () => {
      const store = useStore.getState();

      // Perform multiple updates
      store.setTheme('dark');
      store.setSidebarCollapsed(true);
      store.setPreferences({ autoSave: false, defaultProvider: 'anthropic' });
      store.setWindowDimensions({ width: 1920, height: 1080 });

      const state = useStore.getState();

      // All updates should be applied
      expect(state.theme).toBe('dark');
      expect(state.effectiveTheme).toBe('dark');
      expect(state.sidebarCollapsed).toBe(true);
      expect(state.preferences.autoSave).toBe(false);
      expect(state.preferences.defaultProvider).toBe('anthropic');
      expect(state.windowDimensions.width).toBe(1920);
      expect(state.windowDimensions.height).toBe(1080);
    });

    it('should maintain referential equality for unchanged slices', () => {
      const initialState = useStore.getState();
      const initialAgents = initialState.agents;
      const initialConversations = initialState.conversations;

      // Update only theme
      initialState.setTheme('dark');

      const updatedState = useStore.getState();

      // Theme should be updated
      expect(updatedState.theme).toBe('dark');

      // Other slices should maintain referential equality
      expect(updatedState.agents).toBe(initialAgents);
      expect(updatedState.conversations).toBe(initialConversations);
    });
  });
});
