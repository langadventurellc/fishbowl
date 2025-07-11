/**
 * Zustand middleware for monitoring store operation performance.
 *
 * This middleware wraps the store's set function to monitor:
 * - Action execution time
 * - State size changes
 * - Memory usage
 * - Operation frequency
 * - Error tracking
 *
 * Integrates with StoreOperationPerformanceMonitor for comprehensive tracking.
 */

import type { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { StoreOperationPerformanceMonitor } from './StoreOperationPerformanceMonitor';

type PerformanceMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  options?: PerformanceMiddlewareOptions,
) => StateCreator<T, Mps, Mcs>;

type PerformanceMiddlewareOptions = {
  /**
   * Whether to enable performance monitoring.
   * @default true in development, false in production
   */
  enabled?: boolean;

  /**
   * Prefix for operation names in monitoring.
   * @default 'store'
   */
  operationPrefix?: string;

  /**
   * Whether to track state size changes.
   * @default true
   */
  trackStateSize?: boolean;

  /**
   * Whether to track memory usage.
   * @default true
   */
  trackMemory?: boolean;

  /**
   * Custom operation name extractor.
   */
  extractOperationName?: (args: unknown[]) => string;

  /**
   * Custom metadata extractor.
   */
  extractMetadata?: (args: unknown[]) => Record<string, unknown>;
};

type PerformanceMiddlewareImpl = <T>(
  f: StateCreator<T, [], []>,
  options?: PerformanceMiddlewareOptions,
) => StateCreator<T, [], []>;

/**
 * Performance monitoring middleware implementation.
 */
const performanceMiddlewareImpl: PerformanceMiddlewareImpl = (f, options = {}) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    operationPrefix = 'store',
    trackStateSize = true,
    trackMemory = true,
    extractOperationName,
    extractMetadata,
  } = options;

  return (set, get, store) => {
    const performanceMonitor = StoreOperationPerformanceMonitor.getInstance();

    // Enable monitoring if requested
    if (enabled) {
      performanceMonitor.enable();
    }

    // Wrap the original set function
    const originalSet = set;
    const monitoredSet = (...args: unknown[]) => {
      if (!enabled) {
        return (originalSet as (...args: unknown[]) => void)(...args);
      }

      const operationName = extractOperationName
        ? extractOperationName(args)
        : extractDefaultOperationName(args, operationPrefix);

      const metadata = {
        operationType: 'set' as const,
        sliceName: extractSliceName(args),
        ...(extractMetadata ? extractMetadata(args) : {}),
        trackStateSize,
        trackMemory,
      };

      return performanceMonitor.monitorSyncOperation(
        operationName,
        () => (originalSet as (...args: unknown[]) => void)(...args),
        metadata,
      );
    };

    // Wrap the original setState function if available
    const originalSetState = store.setState;
    const monitoredSetState = (...args: unknown[]) => {
      if (!enabled) {
        return (originalSetState as (...args: unknown[]) => void)(...args);
      }

      const operationName = extractOperationName
        ? extractOperationName(args)
        : extractDefaultOperationName(args, operationPrefix, 'setState');

      const metadata = {
        operationType: 'set' as const,
        sliceName: 'global',
        ...(extractMetadata ? extractMetadata(args) : {}),
        trackStateSize,
        trackMemory,
      };

      return performanceMonitor.monitorSyncOperation(
        operationName,
        () => (originalSetState as (...args: unknown[]) => void)(...args),
        metadata,
      );
    };

    // Replace the store's setState with monitored version
    store.setState = monitoredSetState as typeof store.setState;

    // Initialize the store creator with monitored set function
    const storeCreator = f(monitoredSet as typeof set, get, store);

    // Store reference for global access (for state size monitoring)
    if (typeof window !== 'undefined') {
      (window as { __ZUSTAND_STORE__?: typeof store }).__ZUSTAND_STORE__ = store;
    }

    return storeCreator;
  };
};

/**
 * Extracts a default operation name from the set function arguments.
 */
function extractDefaultOperationName(
  args: unknown[],
  prefix: string,
  suffix: string = 'operation',
): string {
  // Check if first argument is a function (updater function)
  if (typeof args[0] === 'function') {
    return `${prefix}.${suffix}.updater`;
  }

  // Check if first argument is an object (partial state)
  if (args[0] && typeof args[0] === 'object') {
    const keys = Object.keys(args[0]);
    if (keys.length === 1) {
      return `${prefix}.${suffix}.${keys[0]}`;
    } else if (keys.length > 1) {
      return `${prefix}.${suffix}.bulk`;
    }
  }

  // Check if third argument is an action name (for devtools)
  if (typeof args[2] === 'string') {
    return `${prefix}.${args[2]}`;
  }

  return `${prefix}.${suffix}`;
}

/**
 * Extracts slice name from operation arguments.
 */
function extractSliceName(args: unknown[]): string {
  // Check if third argument is an action name with slice info
  if (typeof args[2] === 'string') {
    const actionName = args[2];
    const colonIndex = actionName.indexOf(':');
    if (colonIndex > -1) {
      return actionName.substring(0, colonIndex);
    }

    const slashIndex = actionName.indexOf('/');
    if (slashIndex > -1) {
      return actionName.substring(0, slashIndex);
    }
  }

  // Check if first argument is an object and try to infer slice
  if (args[0] && typeof args[0] === 'object') {
    const keys = Object.keys(args[0]);
    if (keys.length > 0) {
      const firstKey = keys[0];

      // Common slice prefixes
      if (firstKey.startsWith('theme')) return 'theme';
      if (
        firstKey.startsWith('sidebar') ||
        firstKey.startsWith('window') ||
        firstKey.startsWith('layout')
      )
        return 'ui';
      if (firstKey.startsWith('preferences') || firstKey.startsWith('configuration'))
        return 'settings';
      if (firstKey.startsWith('agents') || firstKey.startsWith('agent')) return 'agents';
      if (firstKey.startsWith('conversations') || firstKey.startsWith('conversation'))
        return 'conversations';
    }
  }

  return 'unknown';
}

/**
 * Performance monitoring middleware for Zustand stores.
 *
 * @example
 * ```typescript
 * const useStore = create(
 *   performance(
 *     (set, get) => ({
 *       count: 0,
 *       increment: () => set((state) => ({ count: state.count + 1 })),
 *     }),
 *     {
 *       enabled: process.env.NODE_ENV === 'development',
 *       operationPrefix: 'myStore',
 *     }
 *   )
 * );
 * ```
 */
export const performance = performanceMiddlewareImpl as unknown as PerformanceMiddleware;
