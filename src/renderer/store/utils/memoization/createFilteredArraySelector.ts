import type { AppState } from '../../types';
import { createArraySelector } from './createArraySelector';
import type { ArraySelectorOptions } from './ArraySelectorOptions';

/**
 * Creates a memoized selector for filtering arrays with stable references.
 * This is optimized for the common pattern of filtering arrays in selectors.
 *
 * @param getArray - Function to get the array from state
 * @param predicate - Function to filter array elements
 * @param options - Configuration options
 * @returns A memoized array selector
 */
export const createFilteredArraySelector = <T>(
  getArray: (state: AppState) => T[],
  predicate: (item: T, state: AppState) => boolean,
  options: ArraySelectorOptions<T> = {},
) => {
  return createArraySelector(
    (state: AppState) => getArray(state).filter(item => predicate(item, state)),
    options,
  );
};
