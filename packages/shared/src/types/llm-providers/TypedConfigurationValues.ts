import type { LlmFieldConfig } from "./LlmFieldConfig";
import type { FieldValueType } from "./FieldValueType";

/**
 * Type-safe configuration values extracted from field configuration.
 *
 * Uses field configuration to determine expected value types at compile time.
 *
 * @template T - Array of field configurations
 *
 * @example
 * ```typescript
 * type OpenAiFields = [
 *   SecureTextField & { id: "apiKey" },
 *   TextField & { id: "baseUrl" },
 *   CheckboxField & { id: "useAuthHeader" }
 * ];
 *
 * type OpenAiValues = TypedConfigurationValues<OpenAiFields>;
 * // Result: { apiKey: string; baseUrl: string; useAuthHeader: boolean; }
 * ```
 *
 * @module types/llm-providers/TypedConfigurationValues
 */
export type TypedConfigurationValues<T extends readonly LlmFieldConfig[]> = {
  [K in T[number]["id"]]: FieldValueType<Extract<T[number], { id: K }>>;
};
