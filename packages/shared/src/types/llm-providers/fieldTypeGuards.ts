import type { LlmFieldConfig } from "./LlmFieldConfig";
import type { SecureTextField } from "./SecureTextField";
import type { TextField } from "./TextField";
import type { CheckboxField } from "./CheckboxField";

/**
 * Type guard to check if a field configuration is a SecureTextField.
 *
 * @param field - The field configuration to check
 * @returns True if the field is a SecureTextField
 *
 * @example
 * ```typescript
 * if (isSecureTextField(field)) {
 *   // field is narrowed to SecureTextField
 *   console.log(field.pattern); // Safe to access
 * }
 * ```
 */
export const isSecureTextField = (
  field: LlmFieldConfig,
): field is SecureTextField => field.type === "secure-text";

/**
 * Type guard to check if a field configuration is a TextField.
 *
 * @param field - The field configuration to check
 * @returns True if the field is a TextField
 *
 * @example
 * ```typescript
 * if (isTextField(field)) {
 *   // field is narrowed to TextField
 *   console.log(field.defaultValue); // Safe to access
 * }
 * ```
 */
export const isTextField = (field: LlmFieldConfig): field is TextField =>
  field.type === "text";

/**
 * Type guard to check if a field configuration is a CheckboxField.
 *
 * @param field - The field configuration to check
 * @returns True if the field is a CheckboxField
 *
 * @example
 * ```typescript
 * if (isCheckboxField(field)) {
 *   // field is narrowed to CheckboxField
 *   console.log(field.defaultValue); // Safe to access as boolean
 * }
 * ```
 */
export const isCheckboxField = (
  field: LlmFieldConfig,
): field is CheckboxField => field.type === "checkbox";
