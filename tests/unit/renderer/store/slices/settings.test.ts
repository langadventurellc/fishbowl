/**
 * Settings slice functionality tests
 *
 * Comprehensive tests for settings state management including:
 * - Preferences state management functionality
 * - Configuration state management functionality
 * - Settings actions (set, reset) validation
 * - Settings selectors testing
 * - Settings persistence functionality
 * - Edge cases and error scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStore, resetStore } from '../../../../../src/renderer/store/index';
import {
  selectPreferences,
  selectConfiguration,
  selectSetPreferences,
  selectSetConfiguration,
  selectResetSettings,
  selectSettingsState,
} from '../../../../../src/renderer/store/selectors';

describe('Settings Slice', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Settings State Management', () => {
    it('should initialize with default preferences state', () => {
      const state = useStore.getState();

      expect(state.preferences).toEqual({
        autoSave: true,
        defaultProvider: 'openai',
        maxConversationHistory: 100,
        enableNotifications: true,
      });
    });

    it('should initialize with default configuration state', () => {
      const state = useStore.getState();

      expect(state.configuration).toEqual({
        debugMode: false,
        performanceMode: false,
        experimentalFeatures: false,
      });
    });

    it('should update preferences correctly with partial updates', () => {
      const store = useStore.getState();

      store.setPreferences({
        autoSave: false,
        maxConversationHistory: 200,
      });

      const state = useStore.getState();
      expect(state.preferences).toEqual({
        autoSave: false,
        defaultProvider: 'openai', // unchanged
        maxConversationHistory: 200,
        enableNotifications: true, // unchanged
      });
    });

    it('should update configuration correctly with partial updates', () => {
      const store = useStore.getState();

      store.setConfiguration({
        debugMode: true,
        experimentalFeatures: true,
      });

      const state = useStore.getState();
      expect(state.configuration).toEqual({
        debugMode: true,
        performanceMode: false, // unchanged
        experimentalFeatures: true,
      });
    });

    it('should update preferences with single property change', () => {
      const store = useStore.getState();

      store.setPreferences({ defaultProvider: 'anthropic' });

      const state = useStore.getState();
      expect(state.preferences.defaultProvider).toBe('anthropic');
      expect(state.preferences.autoSave).toBe(true); // unchanged
    });

    it('should update configuration with single property change', () => {
      const store = useStore.getState();

      store.setConfiguration({ performanceMode: true });

      const state = useStore.getState();
      expect(state.configuration.performanceMode).toBe(true);
      expect(state.configuration.debugMode).toBe(false); // unchanged
    });

    it('should handle multiple preference updates correctly', () => {
      const store = useStore.getState();

      // First update
      store.setPreferences({ autoSave: false });

      // Second update
      store.setPreferences({ maxConversationHistory: 50 });

      // Third update
      store.setPreferences({ enableNotifications: false });

      const state = useStore.getState();
      expect(state.preferences).toEqual({
        autoSave: false,
        defaultProvider: 'openai',
        maxConversationHistory: 50,
        enableNotifications: false,
      });
    });

    it('should handle multiple configuration updates correctly', () => {
      const store = useStore.getState();

      // First update
      store.setConfiguration({ debugMode: true });

      // Second update
      store.setConfiguration({ performanceMode: true });

      // Third update
      store.setConfiguration({ experimentalFeatures: true });

      const state = useStore.getState();
      expect(state.configuration).toEqual({
        debugMode: true,
        performanceMode: true,
        experimentalFeatures: true,
      });
    });

    it('should reset settings to defaults', () => {
      const store = useStore.getState();

      // Modify settings
      store.setPreferences({
        autoSave: false,
        defaultProvider: 'anthropic',
        maxConversationHistory: 500,
        enableNotifications: false,
      });

      store.setConfiguration({
        debugMode: true,
        performanceMode: true,
        experimentalFeatures: true,
      });

      // Verify changes
      const initialState = useStore.getState();
      expect(initialState.preferences.autoSave).toBe(false);
      expect(initialState.configuration.debugMode).toBe(true);

      // Reset settings
      store.resetSettings();

      const state = useStore.getState();
      expect(state.preferences).toEqual({
        autoSave: true,
        defaultProvider: 'openai',
        maxConversationHistory: 100,
        enableNotifications: true,
      });

      expect(state.configuration).toEqual({
        debugMode: false,
        performanceMode: false,
        experimentalFeatures: false,
      });
    });
  });

  describe('Settings Selectors', () => {
    it('should select preferences correctly', () => {
      const store = useStore.getState();
      store.setPreferences({ autoSave: false, defaultProvider: 'anthropic' });

      const state = useStore.getState();
      const preferences = selectPreferences(state);

      expect(preferences).toEqual({
        autoSave: false,
        defaultProvider: 'anthropic',
        maxConversationHistory: 100,
        enableNotifications: true,
      });
    });

    it('should select configuration correctly', () => {
      const store = useStore.getState();
      store.setConfiguration({ debugMode: true, performanceMode: true });

      const state = useStore.getState();
      const configuration = selectConfiguration(state);

      expect(configuration).toEqual({
        debugMode: true,
        performanceMode: true,
        experimentalFeatures: false,
      });
    });

    it('should select setPreferences action correctly', () => {
      const state = useStore.getState();
      const setPreferences = selectSetPreferences(state);

      expect(typeof setPreferences).toBe('function');

      // Test that the action works
      setPreferences({ autoSave: false });

      const newState = useStore.getState();
      expect(newState.preferences.autoSave).toBe(false);
    });

    it('should select setConfiguration action correctly', () => {
      const state = useStore.getState();
      const setConfiguration = selectSetConfiguration(state);

      expect(typeof setConfiguration).toBe('function');

      // Test that the action works
      setConfiguration({ debugMode: true });

      const newState = useStore.getState();
      expect(newState.configuration.debugMode).toBe(true);
    });

    it('should select resetSettings action correctly', () => {
      const store = useStore.getState();

      // Modify settings first
      store.setPreferences({ autoSave: false });
      store.setConfiguration({ debugMode: true });

      const state = useStore.getState();
      const resetSettings = selectResetSettings(state);

      expect(typeof resetSettings).toBe('function');

      // Test that the action works
      resetSettings();

      const newState = useStore.getState();
      expect(newState.preferences.autoSave).toBe(true); // default
      expect(newState.configuration.debugMode).toBe(false); // default
    });

    it('should select comprehensive settings state correctly', () => {
      const store = useStore.getState();
      store.setPreferences({ autoSave: false });
      store.setConfiguration({ debugMode: true });

      const state = useStore.getState();
      const settingsState = selectSettingsState(state);

      expect(settingsState).toEqual({
        preferences: {
          autoSave: false,
          defaultProvider: 'openai',
          maxConversationHistory: 100,
          enableNotifications: true,
        },
        configuration: {
          debugMode: true,
          performanceMode: false,
          experimentalFeatures: false,
        },
        setPreferences: expect.any(Function),
        setConfiguration: expect.any(Function),
        resetSettings: expect.any(Function),
      });
    });
  });

  describe('Settings Persistence', () => {
    it('should persist preferences changes to localStorage', () => {
      const store = useStore.getState();

      store.setPreferences({
        autoSave: false,
        defaultProvider: 'anthropic',
        maxConversationHistory: 250,
      });

      const persistedData = localStorage.getItem('fishbowl-store');
      expect(persistedData).toBeTruthy();

      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        expect(parsed.state.preferences).toEqual({
          autoSave: false,
          defaultProvider: 'anthropic',
          maxConversationHistory: 250,
          enableNotifications: true,
        });
      }
    });

    it('should persist configuration changes to localStorage', () => {
      const store = useStore.getState();

      store.setConfiguration({
        debugMode: true,
        performanceMode: true,
        experimentalFeatures: true,
      });

      const persistedData = localStorage.getItem('fishbowl-store');
      expect(persistedData).toBeTruthy();

      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        expect(parsed.state.configuration).toEqual({
          debugMode: true,
          performanceMode: true,
          experimentalFeatures: true,
        });
      }
    });

    it('should persist reset settings correctly', () => {
      const store = useStore.getState();

      // Modify settings
      store.setPreferences({ autoSave: false });
      store.setConfiguration({ debugMode: true });

      // Reset settings
      store.resetSettings();

      const persistedData = localStorage.getItem('fishbowl-store');
      expect(persistedData).toBeTruthy();

      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        expect(parsed.state.preferences.autoSave).toBe(true);
        expect(parsed.state.configuration.debugMode).toBe(false);
      }
    });

    it('should persist settings across store operations', () => {
      const store = useStore.getState();

      // Make complex changes to both preferences and configuration
      store.setPreferences({
        autoSave: false,
        defaultProvider: 'anthropic',
        maxConversationHistory: 250,
        enableNotifications: false,
      });

      store.setConfiguration({
        debugMode: true,
        performanceMode: true,
        experimentalFeatures: true,
      });

      // Verify all changes were persisted to localStorage
      const persistedData = localStorage.getItem('fishbowl-store');
      expect(persistedData).toBeTruthy();

      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        expect(parsed.state.preferences).toEqual({
          autoSave: false,
          defaultProvider: 'anthropic',
          maxConversationHistory: 250,
          enableNotifications: false,
        });
        expect(parsed.state.configuration).toEqual({
          debugMode: true,
          performanceMode: true,
          experimentalFeatures: true,
        });
      }
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty preferences updates gracefully', () => {
      const store = useStore.getState();
      const originalPreferences = { ...store.preferences };

      store.setPreferences({});

      const state = useStore.getState();
      expect(state.preferences).toEqual(originalPreferences);
    });

    it('should handle empty configuration updates gracefully', () => {
      const store = useStore.getState();
      const originalConfiguration = { ...store.configuration };

      store.setConfiguration({});

      const state = useStore.getState();
      expect(state.configuration).toEqual(originalConfiguration);
    });

    it('should handle rapid preference updates correctly', () => {
      const store = useStore.getState();

      // Rapid updates
      store.setPreferences({ autoSave: false });
      store.setPreferences({ autoSave: true });
      store.setPreferences({ autoSave: false });
      store.setPreferences({ maxConversationHistory: 500 });

      const state = useStore.getState();
      expect(state.preferences.autoSave).toBe(false);
      expect(state.preferences.maxConversationHistory).toBe(500);
    });

    it('should handle rapid configuration updates correctly', () => {
      const store = useStore.getState();

      // Rapid updates
      store.setConfiguration({ debugMode: true });
      store.setConfiguration({ debugMode: false });
      store.setConfiguration({ performanceMode: true });
      store.setConfiguration({ experimentalFeatures: true });

      const state = useStore.getState();
      expect(state.configuration.debugMode).toBe(false);
      expect(state.configuration.performanceMode).toBe(true);
      expect(state.configuration.experimentalFeatures).toBe(true);
    });

    it('should handle maxConversationHistory boundary values', () => {
      const store = useStore.getState();

      // Test minimum value
      store.setPreferences({ maxConversationHistory: 1 });
      expect(useStore.getState().preferences.maxConversationHistory).toBe(1);

      // Test large value
      store.setPreferences({ maxConversationHistory: 10000 });
      expect(useStore.getState().preferences.maxConversationHistory).toBe(10000);

      // Test zero value
      store.setPreferences({ maxConversationHistory: 0 });
      expect(useStore.getState().preferences.maxConversationHistory).toBe(0);
    });

    it('should maintain type safety for boolean preferences', () => {
      const store = useStore.getState();

      store.setPreferences({
        autoSave: false,
        enableNotifications: true,
      });

      const state = useStore.getState();
      expect(typeof state.preferences.autoSave).toBe('boolean');
      expect(typeof state.preferences.enableNotifications).toBe('boolean');
      expect(state.preferences.autoSave).toBe(false);
      expect(state.preferences.enableNotifications).toBe(true);
    });

    it('should maintain type safety for boolean configuration', () => {
      const store = useStore.getState();

      store.setConfiguration({
        debugMode: true,
        performanceMode: false,
        experimentalFeatures: true,
      });

      const state = useStore.getState();
      expect(typeof state.configuration.debugMode).toBe('boolean');
      expect(typeof state.configuration.performanceMode).toBe('boolean');
      expect(typeof state.configuration.experimentalFeatures).toBe('boolean');
      expect(state.configuration.debugMode).toBe(true);
      expect(state.configuration.performanceMode).toBe(false);
      expect(state.configuration.experimentalFeatures).toBe(true);
    });

    it('should handle multiple resets correctly', () => {
      const store = useStore.getState();

      // Modify settings
      store.setPreferences({ autoSave: false });
      store.setConfiguration({ debugMode: true });

      // Multiple resets
      store.resetSettings();
      store.resetSettings();
      store.resetSettings();

      const state = useStore.getState();
      expect(state.preferences.autoSave).toBe(true);
      expect(state.configuration.debugMode).toBe(false);
    });
  });
});
