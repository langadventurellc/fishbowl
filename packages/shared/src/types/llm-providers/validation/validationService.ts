/**
 * High-level validation service for LLM provider configurations.
 *
 * Provides static methods for validating provider files, individual providers,
 * and configuration values with comprehensive error reporting.
 *
 * @fileoverview Main validation service integrating all schemas and utilities
 * @module types/llm-providers/validation/validationService
 *
 * @example
 * ```typescript
 * // Validate a complete provider file
 * const result = LlmProviderConfigurationValidator.validateFile(data);
 * if (!result.valid) {
 *   console.error('Validation failed:', result.errors);
 * }
 *
 * // Validate with detailed provider feedback
 * const detailed = LlmProviderConfigurationValidator.validateFileWithDetails(data);
 * detailed.providers?.forEach(provider => {
 *   if (!provider.valid) {
 *     console.error(`Provider ${provider.id} has errors:`, provider.errors);
 *   }
 * });
 * ```
 */

import { LlmProvidersFileSchema } from "./file.schema";
import { LlmProviderConfigSchema } from "./LlmProviderConfigSchema";
import { validateConfigurationValues } from "./validateConfigurationValues";
import { validatePartialConfigurationValues } from "./validatePartialConfigurationValues";
import { buildValidationResult } from "./buildValidationResult";
import { validateFieldValue } from "./validateFieldValue";
import { createFieldError } from "./createFieldError";
import { createInvalidResult } from "./createInvalidResult";
import { createValidResult } from "./createValidResult";

import type { LlmValidationResult } from "./LlmValidationResult";
import type { LlmFieldValidationError } from "./LlmFieldValidationError";
import type { LlmProviderDefinition } from "../LlmProviderDefinition";
import type { LlmConfigurationValues } from "../LlmConfigurationValues";
import type { LlmFieldConfig } from "../LlmFieldConfig";

// Import the enum values for use in error creation
import { LlmValidationErrorCode } from "./LlmValidationErrorCode";

// Helper function to check if data has providers array
function hasProvidersArray(data: unknown): data is { providers: unknown[] } {
  return (
    data !== null &&
    typeof data === "object" &&
    "providers" in data &&
    Array.isArray((data as { providers: unknown }).providers)
  );
}

// Helper function to safely get provider ID
function getProviderId(provider: unknown): string {
  if (
    provider &&
    typeof provider === "object" &&
    "id" in provider &&
    typeof (provider as { id: unknown }).id === "string"
  ) {
    return (provider as { id: string }).id;
  }
  return "unknown";
}

/**
 * High-level validation service for LLM provider configurations.
 *
 * Provides static methods for validating provider files, individual providers,
 * and configuration values with comprehensive error reporting.
 */
export class LlmProviderConfigurationValidator {
  /**
   * Validate a complete provider configuration file.
   *
   * @param data - Unknown data to validate as a providers file
   * @returns Validation result with success status and any errors
   */
  static validateFile(data: unknown): LlmValidationResult {
    const result = LlmProvidersFileSchema.safeParse(data);
    return buildValidationResult(result);
  }

  /**
   * Validate with detailed error reporting per provider.
   *
   * @param data - Unknown data to validate
   * @returns Result with overall validation status and per-provider breakdown
   */
  static validateFileWithDetails(data: unknown): {
    result: LlmValidationResult;
    providers?: Array<{ id: string; valid: boolean; errors: string[] }>;
  } {
    const result = this.validateFile(data);

    // Try to provide detailed validation even if file validation fails,
    // as long as we have a basic structure with providers array
    if (hasProvidersArray(data)) {
      try {
        const providers = data.providers.map((provider: unknown) => {
          const providerId = getProviderId(provider);
          const providerResult = this.validateProvider(provider);
          return {
            id: providerId,
            valid: providerResult.valid,
            errors: providerResult.valid
              ? []
              : providerResult.errors.map(
                  (e) => `${e.fieldId || "root"}: ${e.message}`,
                ),
          };
        });

        return { result, providers };
      } catch {
        // If detailed validation fails, just return the file result
        return { result };
      }
    }

    return { result };
  }

  /**
   * Validate a single provider configuration.
   *
   * @param data - Unknown data to validate as a provider
   * @returns Validation result
   */
  static validateProvider(data: unknown): LlmValidationResult {
    const result = LlmProviderConfigSchema.safeParse(data);
    return buildValidationResult(result);
  }

  /**
   * Validate provider with additional business rules beyond schema.
   *
   * @param provider - Provider definition to validate
   * @returns Validation result including business rule violations
   */
  static validateProviderWithRules(
    provider: LlmProviderDefinition,
  ): LlmValidationResult {
    // Schema validation first
    const schemaResult = this.validateProvider(provider);
    if (!schemaResult.valid) return schemaResult;

    // Business rule validation
    const errors: LlmFieldValidationError[] = [];

    // Check for duplicate field IDs (defensive check beyond schema)
    const fieldIds = provider.configuration.fields.map((f) => f.id);
    const duplicates = fieldIds.filter((id, i) => fieldIds.indexOf(id) !== i);
    if (duplicates.length > 0) {
      errors.push(
        createFieldError(
          "",
          LlmValidationErrorCode.INVALID_CONFIGURATION,
          `Duplicate field IDs: ${duplicates.join(", ")}`,
        ),
      );
    }

    // Check for invalid model references
    const modelIds = Object.keys(provider.models);
    if (modelIds.length === 0) {
      errors.push(
        createFieldError(
          "models",
          LlmValidationErrorCode.INVALID_CONFIGURATION,
          "At least one model must be defined",
        ),
      );
    }

    // Validate field configurations have unique IDs (beyond schema validation)
    const fieldIdSet = new Set(fieldIds);
    if (fieldIdSet.size !== fieldIds.length) {
      errors.push(
        createFieldError(
          "configuration.fields",
          LlmValidationErrorCode.INVALID_CONFIGURATION,
          "Field IDs must be unique within provider configuration",
        ),
      );
    }

    return errors.length > 0
      ? createInvalidResult(errors)
      : createValidResult();
  }

  /**
   * Validate configuration values against provider fields.
   *
   * @param values - Configuration values to validate
   * @param provider - Provider definition with field schemas
   * @returns Validation result
   */
  static validateValues(
    values: LlmConfigurationValues,
    provider: LlmProviderDefinition,
  ): LlmValidationResult {
    return validateConfigurationValues(values, provider.configuration.fields);
  }

  /**
   * Validate partial update of configuration values.
   *
   * @param updates - Partial values to update
   * @param currentValues - Current complete configuration values
   * @param provider - Provider definition
   * @returns Validation result for the update
   */
  static validatePartialValues(
    updates: Partial<LlmConfigurationValues>,
    currentValues: LlmConfigurationValues,
    provider: LlmProviderDefinition,
  ): LlmValidationResult {
    // Use the existing partial validation function
    return validatePartialConfigurationValues(
      updates,
      provider.configuration.fields,
    );
  }

  /**
   * Validate a single field value.
   *
   * @param value - Field value to validate
   * @param field - Field configuration
   * @returns Validation result
   */
  private static validateFieldValue(
    value: unknown,
    field: LlmFieldConfig,
  ): LlmValidationResult {
    const error = validateFieldValue(field.id, value, field);
    return error ? createInvalidResult([error]) : createValidResult();
  }

  /**
   * Development-time validation with console output.
   *
   * @param data - Data to validate
   * @param context - Optional context string for logging
   * @returns Validation result (same as validateFile)
   */
  static validateWithLogging(
    data: unknown,
    context: string = "Validation",
  ): LlmValidationResult {
    const result = this.validateFile(data);

    if (!result.valid && process.env.NODE_ENV === "development") {
      console.error(`[${context}] Validation failed:`);
      result.errors.forEach((error) => {
        console.error(`  - ${error.fieldId || "root"}: ${error.message}`);
      });
    }

    return result;
  }
}
