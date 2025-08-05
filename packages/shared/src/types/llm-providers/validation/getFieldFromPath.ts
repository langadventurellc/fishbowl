import type { LlmFieldConfig } from "../LlmFieldConfig";

/**
 * Finds a field configuration from a nested path.
 *
 * @param path - The error path
 * @param fields - Available field configurations
 * @returns The matching field configuration or undefined
 */
export function getFieldFromPath(
  path: (string | number)[],
  fields: LlmFieldConfig[],
): LlmFieldConfig | undefined {
  // Extract field ID from path - use last string element
  const fieldId =
    path.length > 0 ? path[path.length - 1]?.toString() || "" : "";

  return fields.find((f) => f.id === fieldId);
}
