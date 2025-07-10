/**
 * Select whether the current theme is system-managed
 */

import type { AppState } from '../types';

export const selectIsSystemTheme = (state: AppState): boolean => state.theme === 'system';
