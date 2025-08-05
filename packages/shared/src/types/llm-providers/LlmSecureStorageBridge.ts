/**
 * Extended storage bridge with secure field handling.
 *
 * Provides additional methods for managing sensitive fields
 * (like API keys) separately from the main configuration.
 *
 * @remarks
 * Secure fields are stored separately to enable:
 * - Different encryption levels for sensitive data
 * - Granular access control
 * - Compliance with security best practices
 *
 * @example
 * ```typescript
 * // Store configuration with secure field separation
 * const config = { ...instance };
 * delete config.values.apiKey; // Remove secure field
 * await storage.set(instance.id, config);
 * await storage.setSecureField(instance.id, 'apiKey', apiKey);
 * ```
 */

import type { LlmStorageBridge } from "./LlmStorageBridge";

export interface LlmSecureStorageBridge extends LlmStorageBridge {
  /**
   * Retrieves a secure field value.
   *
   * @param instanceId - Configuration instance ID
   * @param fieldId - Field identifier (e.g., 'apiKey')
   * @returns The decrypted field value or null if not found
   */
  getSecureField(instanceId: string, fieldId: string): Promise<string | null>;

  /**
   * Stores a secure field value.
   *
   * @param instanceId - Configuration instance ID
   * @param fieldId - Field identifier (e.g., 'apiKey')
   * @param value - The value to encrypt and store
   */
  setSecureField(
    instanceId: string,
    fieldId: string,
    value: string,
  ): Promise<void>;

  /**
   * Deletes a secure field.
   *
   * @param instanceId - Configuration instance ID
   * @param fieldId - Field identifier to delete
   */
  deleteSecureField(instanceId: string, fieldId: string): Promise<void>;
}
