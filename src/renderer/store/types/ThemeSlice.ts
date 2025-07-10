/**
 * Theme slice state definition
 */

import type { Theme } from './Theme';

export interface ThemeSlice {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  updateSystemTheme: (systemTheme: 'light' | 'dark') => void;
}
