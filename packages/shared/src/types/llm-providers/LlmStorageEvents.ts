/**
 * Event handlers for storage operations.
 *
 * Enables reactive updates when configurations change,
 * supporting real-time UI synchronization.
 *
 * @example
 * ```typescript
 * const events: LlmStorageEvents = {
 *   onConfigurationAdded: (instance) => {
 *     console.log('New provider added:', instance.displayName);
 *     updateUIState(instance);
 *   },
 *   onConfigurationDeleted: (id) => {
 *     console.log('Provider removed:', id);
 *     removeFromUI(id);
 *   }
 * };
 * ```
 */

import type { LlmProviderInstance } from "./LlmProviderInstance";

export interface LlmStorageEvents {
  /**
   * Called when a new configuration is added.
   *
   * @param instance - The newly added configuration
   */
  onConfigurationAdded?: (instance: LlmProviderInstance) => void;

  /**
   * Called when a configuration is updated.
   *
   * @param instance - The updated configuration
   */
  onConfigurationUpdated?: (instance: LlmProviderInstance) => void;

  /**
   * Called when a configuration is deleted.
   *
   * @param instanceId - ID of the deleted configuration
   */
  onConfigurationDeleted?: (instanceId: string) => void;
}
