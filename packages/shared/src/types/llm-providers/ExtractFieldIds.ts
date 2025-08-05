import type { LlmFieldConfig } from "./LlmFieldConfig";

/**
 * Utility type to extract field IDs from a field configuration array.
 *
 * @example
 * ```typescript
 * const fields = [
 *   { id: "apiKey", type: "secure-text", ... },
 *   { id: "baseUrl", type: "text", ... }
 * ] as const;
 *
 * type FieldIds = ExtractFieldIds<typeof fields>; // "apiKey" | "baseUrl"
 * ```
 */
export type ExtractFieldIds<T extends readonly LlmFieldConfig[]> =
  T[number]["id"];
