/**
 * Apply default values to a partial object
 * @param partial - Partial object with potentially missing fields
 * @param defaults - Complete object with default values
 * @returns Complete object with defaults applied
 */
export function applyDefaults<T extends object>(
  partial: Partial<T>,
  defaults: T,
): T {
  return { ...defaults, ...partial } as T;
}
