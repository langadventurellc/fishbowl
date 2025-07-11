import type { AppState } from '../types';

/**
 * Selects the complete theme state and actions from the store.
 * Uses a cached result to prevent infinite loops in React components.
 * @param state - The application state
 * @returns Complete theme state and all actions
 */
type ThemeStateResult = {
  theme: AppState['theme'];
  systemTheme: AppState['systemTheme'];
  effectiveTheme: AppState['effectiveTheme'];
  isSystemTheme: boolean;
  isDarkTheme: boolean;
  isLightTheme: boolean;
  setTheme: AppState['setTheme'];
  toggleTheme: AppState['toggleTheme'];
  updateSystemTheme: AppState['updateSystemTheme'];
};

let cachedResult: ThemeStateResult | null = null;
let lastState: AppState | null = null;

export const selectThemeState = (state: AppState): ThemeStateResult => {
  // Check if we can return cached result
  if (lastState === state && cachedResult) {
    return cachedResult;
  }

  // Create new result
  cachedResult = {
    theme: state.theme,
    systemTheme: state.systemTheme,
    effectiveTheme: state.effectiveTheme,
    isSystemTheme: state.theme === 'system',
    isDarkTheme: state.effectiveTheme === 'dark',
    isLightTheme: state.effectiveTheme === 'light',
    setTheme: state.setTheme,
    toggleTheme: state.toggleTheme,
    updateSystemTheme: state.updateSystemTheme,
  };

  lastState = state;
  return cachedResult;
};
