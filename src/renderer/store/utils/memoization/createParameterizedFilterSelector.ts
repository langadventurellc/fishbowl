import type { AppState } from '../../types';
import { createParameterizedSelector } from './createParameterizedSelector';
import type { ParameterizedSelectorOptions } from './ParameterizedSelectorOptions';
import { shallowEqual } from './shallowEqual';

/**
 * Creates a memoized selector for filtering arrays with parameters.
 * This is optimized for the common pattern of filtering arrays with dynamic parameters.
 *
 * @param getArray - Function to get the array from state
 * @param predicate - Function to filter array elements (receives parameters)
 * @param options - Configuration options
 * @returns A memoized parameterized filter selector
 */
export const createParameterizedFilterSelector = <T, P extends unknown[]>(
  getArray: (state: AppState) => T[],
  predicate: (item: T, state: AppState, ...parameters: P) => boolean,
  options: ParameterizedSelectorOptions<T[]> = {},
) => {
  return createParameterizedSelector(
    (...parameters: P) =>
      (state: AppState) => {
        const array = getArray(state);
        return array.filter(item => predicate(item, state, ...parameters));
      },
    {
      ...options,
      equalityFn: options.equalityFn ?? shallowEqual,
    },
  );
};
