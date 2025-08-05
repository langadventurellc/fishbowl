import type { LlmFieldConfig } from "./LlmFieldConfig";
import type { SecureTextField } from "./SecureTextField";
import type { TextField } from "./TextField";
import type { CheckboxField } from "./CheckboxField";

/**
 * Maps field configuration types to their corresponding value types.
 *
 * This utility type extracts the expected value type for a given field
 * configuration, enabling type-safe value handling.
 *
 * @example
 * ```typescript
 * type ApiKeyValue = FieldValueType<SecureTextField>; // string
 * type UseAuthValue = FieldValueType<CheckboxField>; // boolean
 *
 * function getValue<T extends LlmFieldConfig>(
 *   field: T,
 *   values: Record<string, unknown>
 * ): FieldValueType<T> {
 *   return values[field.id] as FieldValueType<T>;
 * }
 * ```
 *
 * @template T - The field configuration type
 */
export type FieldValueType<T extends LlmFieldConfig> = T extends SecureTextField
  ? string
  : T extends TextField
    ? string
    : T extends CheckboxField
      ? boolean
      : never;
