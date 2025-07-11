import type { AppState } from '../../types';
import { createParameterizedSelector } from './createParameterizedSelector';
import type { ParameterizedSelectorOptions } from './ParameterizedSelectorOptions';

/**
 * Creates a memoized selector for finding items by ID.
 * This is optimized for the common pattern of finding an item by its ID.
 *
 * @param getArray - Function to get the array from state
 * @param options - Configuration options
 * @returns A memoized find-by-ID selector
 */
export const createFindByIdSelector = <T extends { id: string }>(
  getArray: (state: AppState) => T[],
  options: Omit<ParameterizedSelectorOptions<T | undefined>, 'parameterEqualityFn'> = {},
) => {
  return createParameterizedSelector(
    (id: string) => (state: AppState) => {
      const array = getArray(state);
      return array.find(item => item.id === id);
    },
    options,
  );
};
