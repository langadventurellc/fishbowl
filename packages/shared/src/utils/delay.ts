/**
 * Cross-platform delay utility that works in all JavaScript environments.
 *
 * @param ms - The number of milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
