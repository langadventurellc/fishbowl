/**
 * Debounce utility for IPC calls
 */

export const debounce = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number,
): T => {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);

    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      timeoutId = setTimeout(() => {
        void fn(...args)
          .then(resolve as (value: unknown) => void)
          .catch(reject);
      }, delayMs);
    });
  }) as T;
};
