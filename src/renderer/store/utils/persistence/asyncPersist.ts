/**
 * Async persistence middleware core implementation for Zustand
 */

import type { StateCreator } from 'zustand';
import { AsyncPersistenceManager } from './AsyncPersistenceManager';
import type { AsyncPersistenceConfig, PersistenceMetrics } from './types';

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
 * Creates an async persistence middleware for Zustand
 */
export const asyncPersist = <T>(
  initializer: StateCreator<T, [], [], T>,
  config: AsyncPersistenceConfig,
): StateCreator<T, [], [], T & AsyncPersistenceImpl<T>> => {
  return (set, get, store) => {
    const persistenceManager = AsyncPersistenceManager.getInstance(config);
    let hasHydrated = false;
    let isHydrating = false;
    const hydrationListeners: Array<() => void> = [];

    // Initialize the base state
    const baseState = initializer(set, get, store);

    // Create persistence-aware setState with proper overloads
    const persistentSetState = ((
      partial: T | Partial<T> | ((state: T) => T | Partial<T>),
      replace?: boolean,
    ) => {
      // Handle the two different overloads properly
      if (replace === true) {
        // When replace is true, we need to ensure we have a complete state
        if (typeof partial === 'function') {
          const updater = partial as (state: T) => T | Partial<T>;
          const currentState = get();
          const result = updater(currentState);

          // If the result is a complete state, use it directly
          // Otherwise, merge it with current state
          const completeState =
            typeof result === 'object' && result !== null
              ? ({ ...currentState, ...result } as T)
              : result;

          set(completeState, true);
        } else {
          // If partial is an object, merge it with current state
          const currentState = get();
          const completeState =
            typeof partial === 'object' && partial !== null
              ? ({ ...currentState, ...partial } as T)
              : partial;

          set(completeState, true);
        }
      } else {
        // When replace is false/undefined, use the standard overload
        set(partial as T | Partial<T> | ((state: T) => T | Partial<T>), replace);
      }

      // Queue persistence operation
      const newState = get();
      void persistenceManager.queuePersistence(newState, {
        type: 'update',
        metadata: {
          timestamp: Date.now(),
          hasHydrated,
        },
      });
    }) as typeof set;

    // Hydrate state from storage
    const hydrateState = async () => {
      if (isHydrating || hasHydrated) {
        return;
      }

      isHydrating = true;

      try {
        const persistedState = await persistenceManager.hydrateState();
        if (persistedState) {
          // Merge persisted state with current state
          set(state => ({ ...state, ...persistedState }) as T);
        }

        hasHydrated = true;

        // Call hydration listeners
        hydrationListeners.forEach(listener => {
          try {
            listener();
          } catch (error) {
            console.warn('Error in hydration listener:', error);
          }
        });

        // Call config hydration callback
        if (config.onRehydrateStorage) {
          const onRehydrate = config.onRehydrateStorage();
          if (onRehydrate) {
            onRehydrate(get());
          }
        }
      } catch (error) {
        console.error('Failed to hydrate state:', error);
        hasHydrated = true; // Mark as hydrated even on error to prevent infinite retries

        // Call hydration listeners even on error
        hydrationListeners.forEach(listener => {
          try {
            listener();
          } catch (listenerError) {
            console.warn('Error in hydration listener:', listenerError);
          }
        });

        // Call config hydration callback with error
        if (config.onRehydrateStorage) {
          const onRehydrate = config.onRehydrateStorage();
          if (onRehydrate) {
            onRehydrate(null, error as Error);
          }
        }
      } finally {
        isHydrating = false;
      }
    };

    // Start hydration unless explicitly skipped
    if (!config.skipHydration) {
      // Use setTimeout to ensure hydration happens after store initialization
      setTimeout(() => {
        void hydrateState();
      }, 0);
    } else {
      hasHydrated = true;
    }

    // Override the store's setState to use our persistent version
    store.setState = persistentSetState;

    // Return the enhanced state with persistence methods
    return {
      ...baseState,
      hasHydrated: () => hasHydrated,
      onFinishHydration: (listener: () => void) => {
        if (hasHydrated) {
          // Call immediately if already hydrated
          listener();
          return () => {}; // No-op unsubscribe
        }

        hydrationListeners.push(listener);
        return (): void => {
          const index = hydrationListeners.indexOf(listener);
          if (index > -1) {
            hydrationListeners.splice(index, 1);
          }
        };
      },
      getPersistedState: () => {
        // Return the current state if hydrated, null otherwise
        return hasHydrated ? get() : null;
      },
      persist: {
        setOptions: (options: Partial<AsyncPersistenceConfig>) => {
          // Update persistence manager configuration
          Object.assign(persistenceManager, options);
        },
        clearStorage: () => {
          try {
            config.storage?.removeItem(config.name);
          } catch (error) {
            console.warn('Failed to clear storage:', error);
          }
        },
        rehydrate: async () => {
          hasHydrated = false;
          await hydrateState();
        },
        getMetrics: (): PersistenceMetrics => {
          return persistenceManager.getMetrics();
        },
        flushQueue: async () => {
          await persistenceManager.flushQueue();
        },
        cleanup: () => {
          persistenceManager.cleanup();
        },
      },
    };
  };
};
