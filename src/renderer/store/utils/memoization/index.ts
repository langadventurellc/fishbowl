/**
 * Memoization utilities for Zustand store selectors.
 *
 * This module provides comprehensive memoization solutions for optimizing
 * selector performance in the Fishbowl application's Zustand store.
 *
 * @module MemoizationUtils
 */

import type { AppState } from '../../types';

// Import for internal use
import { createArraySelector as _createArraySelector } from './createArraySelector';
import { createFilteredArraySelector as _createFilteredArraySelector } from './createFilteredArraySelector';
import { createCountSelector as _createCountSelector } from './createCountSelector';
import { createFindByIdSelector as _createFindByIdSelector } from './createFindByIdSelector';
import { createMemoizedSelector as _createMemoizedSelector } from './createMemoizedSelectorImpl';

// Core memoization utilities
export { createMemoizedSelector } from './createMemoizedSelectorImpl';
export { shallowEqual } from './shallowEqual';
export type { MemoizedSelectorOptions } from './MemoizedSelectorOptions';
export type { SelectorPerformanceMetrics } from './SelectorPerformanceMetrics';

export { createArraySelector } from './createArraySelector';
export { createFilteredArraySelector } from './createFilteredArraySelector';
export { createCountSelector } from './createCountSelector';
export type { ArraySelectorOptions } from './ArraySelectorOptions';

export { createParameterizedSelector } from './createParameterizedSelector';
export { createFindByIdSelector } from './createFindByIdSelector';
export { createParameterizedFilterSelector } from './createParameterizedFilterSelector';
export type { ParameterizedSelectorOptions } from './ParameterizedSelectorOptions';

// Performance monitoring
export { SelectorPerformanceMonitor } from './SelectorPerformanceMonitor';
export { getPerformanceMonitor } from './getPerformanceMonitor';
export type { SelectorWithMetrics } from './SelectorWithMetrics';

/**
 * Development utilities for enabling performance monitoring.
 */
export const enablePerformanceMonitoring = async () => {
  if (process.env.NODE_ENV === 'development') {
    const { SelectorPerformanceMonitor } = await import('./SelectorPerformanceMonitor');
    const monitor = SelectorPerformanceMonitor.getInstance();
    monitor.enable(5000); // Check every 5 seconds

    // Add global access for debugging
    (
      window as unknown as { __SELECTOR_PERFORMANCE_MONITOR__: unknown }
    ).__SELECTOR_PERFORMANCE_MONITOR__ = monitor;

    console.warn(
      '🎯 Selector performance monitoring enabled. Access via window.__SELECTOR_PERFORMANCE_MONITOR__',
    );
  }
};

/**
 * Production-safe performance monitoring that only enables in development.
 */
export const conditionallyEnablePerformanceMonitoring = async () => {
  if (process.env.NODE_ENV === 'development') {
    await enablePerformanceMonitoring();
  }
};

/**
 * Utility to register a selector with performance monitoring in development.
 * @param name - Name of the selector for monitoring
 * @param selector - The selector function with metrics
 */
export const registerSelectorForMonitoring = async <T extends unknown[], R>(
  name: string,
  selector: import('./SelectorWithMetrics').SelectorWithMetrics | ((...args: T) => R),
) => {
  if (process.env.NODE_ENV === 'development') {
    const { SelectorPerformanceMonitor } = await import('./SelectorPerformanceMonitor');
    const monitor = SelectorPerformanceMonitor.getInstance();
    monitor.registerSelector(name, selector as import('./SelectorWithMetrics').SelectorWithMetrics);
  }
};

/**
 * Common memoization patterns for quick setup.
 */
export const MemoizationPatterns = {
  /**
   * Standard array selector with shallow equality.
   */
  arraySelector: <T>(selector: (state: AppState) => T[]) => {
    return _createArraySelector(selector, {
      enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
    });
  },

  /**
   * Count selector for array length operations.
   */
  countSelector: <T>(
    getArray: (state: AppState) => T[],
    predicate?: (item: T, state: AppState) => boolean,
  ) => {
    return _createCountSelector(getArray, predicate, {
      enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
    });
  },

  /**
   * Filtered array selector with performance monitoring.
   */
  filteredArraySelector: <T>(
    getArray: (state: AppState) => T[],
    predicate: (item: T, state: AppState) => boolean,
  ) => {
    return _createFilteredArraySelector(getArray, predicate, {
      enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
    });
  },

  /**
   * Find-by-ID selector with caching.
   */
  findByIdSelector: <T extends { id: string }>(getArray: (state: AppState) => T[]) => {
    return _createFindByIdSelector(getArray, {
      enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
    });
  },

  /**
   * Simple memoized selector for basic values.
   */
  simpleSelector: <T>(selector: (state: AppState) => T) => {
    return _createMemoizedSelector(selector, {
      enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
    });
  },
} as const;
