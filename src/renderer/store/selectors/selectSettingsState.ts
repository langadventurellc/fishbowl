/**
 * Select all settings-related state and actions
 * Useful for components that need comprehensive settings access
 */

import type { AppState } from '../types';

export const selectSettingsState = (state: AppState) => ({
  preferences: state.preferences,
  configuration: state.configuration,
  setPreferences: state.setPreferences,
  setConfiguration: state.setConfiguration,
  resetSettings: state.resetSettings,
});
