/**
 * Throttle utility for IPC calls
 */

export const throttle = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number,
): T => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    const now = Date.now();

    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      if (now - lastCall >= delayMs) {
        lastCall = now;
        void fn(...args)
          .then(resolve as (value: unknown) => void)
          .catch(reject);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            lastCall = Date.now();
            void fn(...args)
              .then(resolve as (value: unknown) => void)
              .catch(reject);
          },
          delayMs - (now - lastCall),
        );
      }
    });
  }) as T;
};
