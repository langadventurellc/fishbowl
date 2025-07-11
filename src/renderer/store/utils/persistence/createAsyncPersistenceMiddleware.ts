/**
 * Creates async persistence middleware factory function
 */

import type { StateCreator } from 'zustand';
import type { AsyncPersistenceConfig, PersistenceMetrics } from './types';
import { asyncPersist } from './asyncPersist';

type AsyncPersistenceImpl<T> = {
  hasHydrated: () => boolean;
  onFinishHydration: (listener: () => void) => () => void;
  getPersistedState: () => Partial<T> | null;
  persist: {
    setOptions: (options: Partial<AsyncPersistenceConfig>) => void;
    clearStorage: () => void;
    rehydrate: () => Promise<void>;
    getMetrics: () => PersistenceMetrics;
    flushQueue: () => Promise<void>;
    cleanup: () => void;
  };
};

/**
 * Type-safe async persistence middleware factory
 */
export const createAsyncPersistenceMiddleware = <T>(
  config: AsyncPersistenceConfig,
): ((
  initializer: StateCreator<T, [], [], T>,
) => StateCreator<T, [], [], T & AsyncPersistenceImpl<T>>) => {
  return (initializer: StateCreator<T, [], [], T>) => {
    return asyncPersist(initializer, config);
  };
};
