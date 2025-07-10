/**
 * Creates an optimistic update function that immediately updates the store
 * and then syncs with the backend, reverting on error
 */
export function createOptimisticUpdate<T, A extends unknown[]>(
  optimisticUpdater: (...args: A) => void,
  ipcOperation: (...args: A) => Promise<T>,
  confirmedUpdater: (data: T) => void,
  revertUpdater: (...args: A) => void,
  errorHandler: (error: string) => void,
) {
  return async (...args: A): Promise<T | null> => {
    // Apply optimistic update immediately
    optimisticUpdater(...args);

    try {
      // Sync with backend
      const result = await ipcOperation(...args);
      // Confirm with server data
      confirmedUpdater(result);
      return result;
    } catch (error) {
      // Revert optimistic update on error
      revertUpdater(...args);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errorHandler(errorMessage);
      return null;
    }
  };
}
