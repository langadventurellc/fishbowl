/**
 * Creates a bridge function that connects IPC operations with Zustand store updates
 * Handles loading states, error handling, and store synchronization
 */
export function createIPCStoreBridge<T, A extends unknown[]>(
  ipcOperation: (...args: A) => Promise<T>,
  storeUpdater: (data: T) => void,
  errorHandler: (error: string) => void,
  loadingSetter: (loading: boolean) => void,
) {
  return async (...args: A): Promise<T | null> => {
    loadingSetter(true);
    try {
      const result = await ipcOperation(...args);
      storeUpdater(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errorHandler(errorMessage);
      return null;
    } finally {
      loadingSetter(false);
    }
  };
}
