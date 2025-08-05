import type { LlmFieldConfig } from "../LlmFieldConfig";
import type { LlmConfigurationValues } from "../LlmConfigurationValues";

/**
 * Context information for validation operations.
 *
 * Provides all necessary data for validators to check field values
 * against their configuration.
 *
 * @module types/llm-providers/LlmValidationContext
 */
export interface LlmValidationContext {
  /**
   * ID of the provider being configured.
   * Used to look up provider-specific validation rules.
   */
  providerId: string;

  /**
   * Field configurations defining validation rules.
   * Must match the provider's field definitions.
   */
  fields: readonly LlmFieldConfig[];

  /**
   * Current field values to validate.
   * Keys should match field IDs from configuration.
   */
  values: LlmConfigurationValues;

  /**
   * Validation mode indicating the operation type.
   * Affects which fields are required.
   */
  mode: "create" | "update";
}
