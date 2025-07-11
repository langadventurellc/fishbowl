/**
 * Configuration options for async persistence operations
 */
export interface AsyncPersistenceConfig {
  /**
   * Name of the persistence storage key
   */
  name: string;

  /**
   * Version of the persistence schema
   */
  version: number;

  /**
   * Function to select which parts of state to persist
   */
  partialize?: <T>(state: T) => Partial<T>;

  /**
   * Throttle delay in milliseconds between persistence operations
   * @default 100
   */
  throttleMs?: number;

  /**
   * Maximum time to wait for ideal callback before forcing persistence
   * @default 1000
   */
  maxWaitMs?: number;

  /**
   * Enable performance monitoring for persistence operations
   * @default true
   */
  enablePerformanceMonitoring?: boolean;

  /**
   * Storage implementation to use
   * @default localStorage
   */
  storage?: Storage;

  /**
   * Function to serialize state before storage
   * @default JSON.stringify
   */
  serialize?: (state: unknown) => string;

  /**
   * Function to deserialize state from storage
   * @default JSON.parse
   */
  deserialize?: (str: string) => unknown;

  /**
   * Migration function for handling version changes
   */
  migrate?: (persistedState: unknown, version: number) => unknown;

  /**
   * Callback for when hydration is complete
   */
  onRehydrateStorage?: () => (state: unknown, error?: Error) => void;

  /**
   * Whether to skip hydration during initialization
   * @default false
   */
  skipHydration?: boolean;
}
