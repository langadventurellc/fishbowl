/**
 * Select window dimensions
 */

import type { AppState } from '../types';

export const selectWindowDimensions = (state: AppState): { width: number; height: number } =>
  state.windowDimensions;
