/**
 * Store slice type definition
 */

import type { StateCreator } from 'zustand';
import type { AppState } from './app-state';

/**
 * Store slice creator type with proper middleware typing
 */
export type StoreSlice<T> = StateCreator<
  AppState,
  [['zustand/devtools', never], ['zustand/persist', unknown], ['zustand/immer', never]],
  [],
  T
>;
