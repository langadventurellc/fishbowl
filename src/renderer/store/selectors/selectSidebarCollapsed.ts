/**
 * Select sidebar collapse state
 */

import type { AppState } from '../types';

export const selectSidebarCollapsed = (state: AppState): boolean => state.sidebarCollapsed;
