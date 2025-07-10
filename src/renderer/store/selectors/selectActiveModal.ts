/**
 * Select current active modal
 */

import type { AppState } from '../types';

export const selectActiveModal = (state: AppState): string | null => state.activeModal;
