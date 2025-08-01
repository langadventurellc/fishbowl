/**
 * Apply default values to partial objects, creating complete objects
 * @param partial - Partial object with some fields
 * @param defaults - Complete default object
 * @returns Complete object with defaults applied to missing fields
 */
export function applyDefaults<T extends Record<string, unknown>>(
  partial: Partial<T>,
  defaults: T,
): T {
  // Prevent prototype pollution
  const cleanPartial: Record<string, unknown> = {};

  // Copy only own properties from partial, excluding dangerous keys
  for (const key of Object.keys(partial)) {
    if (
      Object.prototype.hasOwnProperty.call(partial, key) &&
      key !== "__proto__" &&
      key !== "constructor" &&
      key !== "prototype"
    ) {
      cleanPartial[key] = partial[key];
    }
  }

  // Merge with defaults
  return { ...defaults, ...cleanPartial } as T;
}
