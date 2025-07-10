/**
 * Select whether the current effective theme is dark
 */

import type { AppState } from '../types';

export const selectIsDarkTheme = (state: AppState): boolean => state.effectiveTheme === 'dark';
