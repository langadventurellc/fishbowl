/**
 * Type-safe field selection from objects
 * @param obj - Source object
 * @param fields - Array of field names to pick
 * @returns New object with only selected fields
 */
export function pickFields<T, K extends keyof T>(
  obj: T,
  fields: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const field of fields) {
    // Security: Prevent prototype pollution
    if (
      field === "__proto__" ||
      field === "constructor" ||
      field === "prototype"
    ) {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(obj, field)) {
      result[field] = obj[field];
    }
  }

  return result;
}
