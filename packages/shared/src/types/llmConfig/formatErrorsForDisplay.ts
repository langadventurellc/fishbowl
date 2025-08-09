import type { ValidationError } from "./ValidationError";
import { groupErrorsByField } from "./groupErrorsByField";
import { getFieldDisplayName } from "./getFieldDisplayName";

/**
 * Formats errors for display in UI
 */
export function formatErrorsForDisplay(
  errors: ValidationError[],
): Array<{ field: string; messages: string[] }> {
  const grouped = groupErrorsByField(errors);

  return Object.entries(grouped).map(([field, fieldErrors]) => ({
    field: getFieldDisplayName(field),
    messages: fieldErrors.map((e) => e.message),
  }));
}
