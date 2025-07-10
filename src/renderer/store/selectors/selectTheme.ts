/**
 * Select the current theme setting
 */

import type { AppState, Theme } from '../types';

export const selectTheme = (state: AppState): Theme => state.theme;
