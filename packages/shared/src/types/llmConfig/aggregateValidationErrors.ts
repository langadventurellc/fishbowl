import type { ValidationError } from "./ValidationError";
import type { StandardizedValidationResult } from "./StandardizedValidationResult";

/**
 * Aggregates multiple validation results or errors
 */
export function aggregateValidationErrors(
  ...results: Array<StandardizedValidationResult | ValidationError[]>
): ValidationError[] {
  const allErrors: ValidationError[] = [];

  for (const result of results) {
    if (Array.isArray(result)) {
      allErrors.push(...result);
    } else if (!result.success) {
      allErrors.push(...result.errors);
    }
  }

  // Remove duplicate errors (same field and code)
  const seen = new Set<string>();
  return allErrors.filter((error) => {
    const key = `${error.field}:${error.code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
