/**
 * Settings slice for Zustand store
 *
 * Manages application settings and configuration:
 * - User preferences (auto-save, notifications, etc.)
 * - Application configuration (debug mode, performance settings)
 * - Settings persistence and reset functionality
 */

import type { StoreSlice, SettingsSlice } from '../types';

/**
 * Settings slice default values
 */
const defaultPreferences = {
  autoSave: true,
  defaultProvider: 'openai',
  maxConversationHistory: 100,
  enableNotifications: true,
};

const defaultConfiguration = {
  debugMode: false,
  performanceMode: false,
  experimentalFeatures: false,
};

/**
 * Create settings slice with all settings-related state and actions
 */
export const createSettingsSlice: StoreSlice<SettingsSlice> = (set, _get) => ({
  // Settings state
  preferences: defaultPreferences,
  configuration: defaultConfiguration,

  // Preferences actions
  setPreferences: (preferences: Partial<SettingsSlice['preferences']>) => {
    set(state => {
      state.preferences = {
        ...state.preferences,
        ...preferences,
      };
    });
  },

  // Configuration actions
  setConfiguration: (config: Partial<SettingsSlice['configuration']>) => {
    set(state => {
      state.configuration = {
        ...state.configuration,
        ...config,
      };
    });
  },

  // Reset settings to defaults
  resetSettings: () => {
    set(state => {
      state.preferences = { ...defaultPreferences };
      state.configuration = { ...defaultConfiguration };
    });
  },
});
