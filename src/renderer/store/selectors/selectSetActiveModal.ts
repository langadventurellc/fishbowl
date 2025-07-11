/**
 * Select active modal setter action
 */

import type { AppState } from '../types';

export const selectSetActiveModal = (state: AppState) => state.setActiveModal;
