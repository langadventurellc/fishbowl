/**
 * Type-safe field selection from objects
 * @param obj - Source object
 * @param fields - Fields to pick
 * @returns Object with only selected fields
 */
export function pickFields<T extends object, K extends keyof T>(
  obj: T,
  fields: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const field of fields) {
    if (field in obj) {
      result[field] = obj[field];
    }
  }

  return result;
}
