/**
 * Select the effective theme (resolved theme for display)
 */

import type { AppState } from '../types';

export const selectEffectiveTheme = (state: AppState): 'light' | 'dark' => state.effectiveTheme;
