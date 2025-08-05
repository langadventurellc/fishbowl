import { z } from "zod";
import type { LlmFieldConfig } from "../LlmFieldConfig";

/**
 * Formats a Zod issue into a user-friendly message using field labels.
 *
 * @param issue - The Zod issue to format
 * @param field - Optional field configuration for label lookup
 * @returns Formatted error message
 */
export function formatZodMessage(
  issue: z.ZodIssue,
  field?: LlmFieldConfig,
): string {
  // Use field label if available, otherwise use the default Zod message
  if (field) {
    const fieldName = field.label;

    switch (issue.code) {
      case "too_small":
        return `${fieldName} is required`;

      case "invalid_type":
        return `${fieldName} must be a valid value`;

      case "invalid_format":
        return `${fieldName} format is invalid`;

      default:
        return `${fieldName} is invalid`;
    }
  }

  // Fall back to Zod's default message
  return issue.message;
}
