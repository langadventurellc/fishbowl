/**
 * Select the current system theme
 */

import type { AppState } from '../types';

export const selectSystemTheme = (state: AppState): 'light' | 'dark' => state.systemTheme;
