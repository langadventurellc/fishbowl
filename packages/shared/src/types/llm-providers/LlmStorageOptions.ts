/**
 * Configuration options for storage bridge initialization.
 *
 * Allows platform-specific customization of storage behavior
 * while maintaining a consistent interface.
 *
 * @example
 * ```typescript
 * const options: LlmStorageOptions = {
 *   namespace: 'fishbowl.llm',
 *   encryptionKey: await getDeviceKey(),
 *   events: {
 *     onConfigurationAdded: handleNewProvider
 *   }
 * };
 * const storage = createStorage(options);
 * ```
 */

import type { LlmStorageEvents } from "./LlmStorageEvents";

export interface LlmStorageOptions {
  /**
   * Platform-specific encryption key.
   *
   * @remarks
   * - Desktop: May use device-specific key from keytar
   * - Mobile: May use Expo SecureStore's built-in encryption
   * - Testing: May use a fixed key for deterministic tests
   */
  encryptionKey?: string;

  /**
   * Storage namespace or key prefix.
   *
   * @remarks
   * Prevents key collisions when multiple features use storage.
   *
   * @default "fishbowl.llm"
   */
  namespace?: string;

  /**
   * Event handlers for storage operations.
   */
  events?: LlmStorageEvents;
}
