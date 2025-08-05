import type { LlmFieldConfig } from "./LlmFieldConfig";

/**
 * Utility type to get a specific field configuration by its ID.
 *
 * @example
 * ```typescript
 * const fields = [
 *   { id: "apiKey", type: "secure-text", ... },
 *   { id: "baseUrl", type: "text", ... }
 * ] as const;
 *
 * type ApiKeyField = GetFieldById<typeof fields, "apiKey">; // SecureTextField type
 * ```
 */
export type GetFieldById<
  T extends readonly LlmFieldConfig[],
  Id extends string,
> = Extract<T[number], { id: Id }>;
