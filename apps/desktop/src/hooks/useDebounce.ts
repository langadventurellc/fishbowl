import { useCallback, useRef } from "react";

/**
 * Custom hook for debouncing function calls
 * Used for real-time validation to avoid excessive validation calls during rapid typing
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds before executing the callback
 * @returns The debounced function
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<number | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  ) as T;
}
