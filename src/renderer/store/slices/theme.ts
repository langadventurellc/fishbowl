/**
 * Theme slice for Zustand store
 *
 * Manages application theme state with support for:
 * - Light/dark/system theme modes
 * - System theme detection and following
 * - Automatic DOM attribute updates
 * - LocalStorage persistence (handled by store middleware)
 */

import type { StoreSlice, ThemeSlice, Theme } from '../types';

/**
 * Theme slice default values
 */
const defaultTheme: Theme = 'system';
const defaultSystemTheme: 'light' | 'dark' = 'light';

/**
 * Create theme slice with all theme-related state and actions
 */
export const createThemeSlice: StoreSlice<ThemeSlice> = (set, get) => ({
  // Theme state
  theme: defaultTheme,
  systemTheme: defaultSystemTheme,
  effectiveTheme: defaultSystemTheme,

  // Theme actions
  setTheme: (theme: Theme) => {
    set(state => {
      state.theme = theme;

      // Calculate effective theme
      if (theme === 'system') {
        state.effectiveTheme = state.systemTheme;
      } else {
        state.effectiveTheme = theme;
      }

      // Update DOM attribute
      document.documentElement.setAttribute('data-theme', state.effectiveTheme);
    });
  },

  toggleTheme: () => {
    const currentTheme = get().theme;

    set(state => {
      // Toggle between light and dark (skip system)
      if (currentTheme === 'light') {
        state.theme = 'dark';
        state.effectiveTheme = 'dark';
      } else if (currentTheme === 'dark') {
        state.theme = 'light';
        state.effectiveTheme = 'light';
      } else {
        // If system, toggle to opposite of current system theme
        state.theme = state.systemTheme === 'dark' ? 'light' : 'dark';
        state.effectiveTheme = state.theme;
      }

      // Update DOM attribute
      document.documentElement.setAttribute('data-theme', state.effectiveTheme);
    });
  },

  updateSystemTheme: (systemTheme: 'light' | 'dark') => {
    set(state => {
      state.systemTheme = systemTheme;

      // Update effective theme if using system theme
      if (state.theme === 'system') {
        state.effectiveTheme = systemTheme;
        document.documentElement.setAttribute('data-theme', systemTheme);
      }
    });
  },
});
