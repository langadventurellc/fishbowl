import { SettingsError } from "./SettingsError";
import { SettingsErrorCode } from "./SettingsErrorCode";

/**
 * Factory function for creating consistent settings errors
 *
 * @param message - The error message
 * @param code - Error code for programmatic handling
 * @param details - Additional error context
 * @returns SettingsError instance
 *
 * @example
 * ```typescript
 * const error = createSettingsError(
 *   'Failed to save settings',
 *   SettingsErrorCode.PERSISTENCE_FAILED,
 *   { operation: 'save' }
 * );
 * ```
 */
export function createSettingsError(
  message: string,
  code: SettingsErrorCode,
  details?: Record<string, unknown>,
): SettingsError {
  return new SettingsError(message, code, details);
}
