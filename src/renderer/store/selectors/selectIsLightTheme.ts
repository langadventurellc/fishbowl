/**
 * Select whether the current effective theme is light
 */

import type { AppState } from '../types';

export const selectIsLightTheme = (state: AppState): boolean => state.effectiveTheme === 'light';
