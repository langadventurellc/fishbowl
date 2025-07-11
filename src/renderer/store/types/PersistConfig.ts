/**
 * Persistence configuration type
 */

import { AppState } from './app-state';

export interface PersistConfig {
  name: string;
  partialize?: (state: AppState) => Partial<AppState>;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => AppState;
  storage?: Storage;
}
