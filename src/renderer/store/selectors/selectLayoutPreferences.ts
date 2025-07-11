/**
 * Select layout preferences
 */

import type { AppState } from '../types';

export const selectLayoutPreferences = (
  state: AppState,
): { sidebarWidth: number; mainContentHeight: number } => state.layoutPreferences;
