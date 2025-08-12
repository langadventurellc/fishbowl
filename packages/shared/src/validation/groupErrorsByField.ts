import type { ValidationError } from "../types/llmConfig/ValidationError";

/**
 * Groups errors by field name
 */
export function groupErrorsByField(
  errors: ValidationError[],
): Record<string, ValidationError[]> {
  return errors.reduce(
    (groups, error) => {
      const field = error.field;
      groups[field] = groups[field] || [];
      groups[field].push(error);
      return groups;
    },
    {} as Record<string, ValidationError[]>,
  );
}
