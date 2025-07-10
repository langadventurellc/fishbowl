/**
 * Select all theme-related state and actions
 * Useful for components that need comprehensive theme access
 */

import type { AppState } from '../types';

export const selectThemeState = (state: AppState) => ({
  theme: state.theme,
  systemTheme: state.systemTheme,
  effectiveTheme: state.effectiveTheme,
  isSystemTheme: state.theme === 'system',
  isDarkTheme: state.effectiveTheme === 'dark',
  isLightTheme: state.effectiveTheme === 'light',
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme,
  updateSystemTheme: state.updateSystemTheme,
});
