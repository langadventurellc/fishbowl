import type { SecureTextField } from "./SecureTextField";
import type { TextField } from "./TextField";
import type { CheckboxField } from "./CheckboxField";

/**
 * Discriminated union type for all supported LLM provider field configurations.
 *
 * This type uses the 'type' property as a discriminator to enable
 * TypeScript's narrowing capabilities.
 *
 * @example
 * ```typescript
 * function renderField(field: LlmFieldConfig) {
 *   switch (field.type) {
 *     case "secure-text":
 *       // field is narrowed to SecureTextField
 *       return renderSecureInput(field);
 *     case "text":
 *       // field is narrowed to TextField
 *       return renderTextInput(field);
 *     case "checkbox":
 *       // field is narrowed to CheckboxField
 *       return renderCheckbox(field);
 *   }
 * }
 * ```
 *
 * @module types/llm-providers/LlmFieldConfig
 */
export type LlmFieldConfig = SecureTextField | TextField | CheckboxField;
