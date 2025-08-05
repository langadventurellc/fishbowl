/**
 * Factory function type for creating storage bridge instances.
 *
 * Enables dependency injection and platform-specific initialization.
 *
 * @example
 * ```typescript
 * // Desktop implementation
 * const createDesktopStorage: LlmStorageFactory = (options) => {
 *   return new ElectronSecureStorage(options);
 * };
 *
 * // Mobile implementation
 * const createMobileStorage: LlmStorageFactory = (options) => {
 *   return new ExpoSecureStorage(options);
 * };
 * ```
 */

import type { LlmSecureStorageBridge } from "./LlmSecureStorageBridge";
import type { LlmStorageOptions } from "./LlmStorageOptions";

export type LlmStorageFactory = (
  options?: LlmStorageOptions,
) => LlmSecureStorageBridge;
