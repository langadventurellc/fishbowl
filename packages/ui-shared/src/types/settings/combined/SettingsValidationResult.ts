import type { SettingsCategory } from "./SettingsCategory";

/**
 * Settings validation result interface
 * Provides structured validation feedback with category-specific errors and warnings
 */
export interface SettingsValidationResult {
  /** Whether all settings are valid and can be saved */
  isValid: boolean;

  /** Validation errors by category, keyed by field name */
  errors?: Record<SettingsCategory, string[]>;

  /** Optional warnings that don't prevent saving but should be shown to users */
  warnings?: Record<SettingsCategory, string[]>;
}
