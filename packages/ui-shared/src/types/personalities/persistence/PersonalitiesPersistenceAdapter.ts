import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";

/**
 * Platform-agnostic interface for persisting personalities configuration.
 *
 * Implementations of this interface handle the platform-specific details
 * of storing and retrieving personalities data, while maintaining a consistent
 * API across desktop and mobile platforms.
 *
 * @example
 * ```typescript
 * const adapter: PersonalitiesPersistenceAdapter = createDesktopPersonalitiesAdapter();
 *
 * // Save personalities
 * await adapter.save(personalitiesData);
 *
 * // Load personalities
 * const personalities = await adapter.load();
 *
 * // Reset to defaults
 * await adapter.reset();
 * ```
 */
export interface PersonalitiesPersistenceAdapter {
  /**
   * Persists the provided personalities data to the platform's storage mechanism.
   *
   * @param personalities - The personalities data to persist
   * @throws {PersonalitiesPersistenceError} If the save operation fails
   *
   * @example
   * ```typescript
   * try {
   *   await adapter.save({
   *     schemaVersion: "1.0.0",
   *     lastUpdated: new Date().toISOString(),
   *     personalities: [
   *       {
   *         id: "personality-1",
   *         name: "Creative Thinker",
   *         bigFive: {
   *           openness: 85,
   *           conscientiousness: 60,
   *           extraversion: 75,
   *           agreeableness: 70,
   *           neuroticism: 30
   *         },
   *         behaviors: {
   *           creativity: 90,
   *           analytical: 65,
   *           empathy: 80
   *         },
   *         customInstructions: "Focus on innovative solutions and creative problem-solving approaches.",
   *         createdAt: "2025-01-01T00:00:00.000Z",
   *         updatedAt: "2025-01-01T00:00:00.000Z"
   *       }
   *     ]
   *   });
   * } catch (error) {
   *   if (error instanceof PersonalitiesPersistenceError) {
   *     console.error(`Save failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  save(personalities: PersistedPersonalitiesSettingsData): Promise<void>;

  /**
   * Loads the persisted personalities data from the platform's storage mechanism.
   *
   * @returns The loaded personalities data, or null if no personalities are found
   * @throws {PersonalitiesPersistenceError} If the load operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const personalities = await adapter.load();
   *   if (personalities) {
   *     console.log(`Loaded ${personalities.personalities.length} personalities`);
   *   } else {
   *     console.log("No personalities found, using defaults");
   *   }
   * } catch (error) {
   *   if (error instanceof PersonalitiesPersistenceError) {
   *     console.error(`Load failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  load(): Promise<PersistedPersonalitiesSettingsData | null>;

  /**
   * Resets the persisted personalities by removing them from storage.
   * After calling this method, subsequent calls to `load()` will return null
   * until new personalities are saved.
   *
   * @throws {PersonalitiesPersistenceError} If the reset operation fails
   *
   * @example
   * ```typescript
   * try {
   *   await adapter.reset();
   *   console.log("Personalities reset successfully");
   * } catch (error) {
   *   if (error instanceof PersonalitiesPersistenceError) {
   *     console.error(`Reset failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  reset(): Promise<void>;
}
