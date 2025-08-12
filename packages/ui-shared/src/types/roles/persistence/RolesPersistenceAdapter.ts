import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";

/**
 * Platform-agnostic interface for persisting roles configuration.
 *
 * Implementations of this interface handle the platform-specific details
 * of storing and retrieving roles data, while maintaining a consistent
 * API across desktop and mobile platforms.
 *
 * @example
 * ```typescript
 * const adapter: RolesPersistenceAdapter = createDesktopRolesAdapter();
 *
 * // Save roles
 * await adapter.save(rolesData);
 *
 * // Load roles
 * const roles = await adapter.load();
 *
 * // Reset to defaults
 * await adapter.reset();
 * ```
 */
export interface RolesPersistenceAdapter {
  /**
   * Persists the provided roles data to the platform's storage mechanism.
   *
   * @param roles - The roles data to persist
   * @throws {RolesPersistenceError} If the save operation fails
   *
   * @example
   * ```typescript
   * try {
   *   await adapter.save({
   *     schemaVersion: "1.0.0",
   *     lastUpdated: new Date().toISOString(),
   *     roles: [
   *       {
   *         id: "role-1",
   *         name: "Assistant",
   *         description: "Helpful assistant",
   *         systemPrompt: "You are a helpful assistant",
   *         createdAt: "2025-01-01T00:00:00.000Z",
   *         updatedAt: "2025-01-01T00:00:00.000Z"
   *       }
   *     ]
   *   });
   * } catch (error) {
   *   if (error instanceof RolesPersistenceError) {
   *     console.error(`Save failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  save(roles: PersistedRolesSettingsData): Promise<void>;

  /**
   * Loads the persisted roles data from the platform's storage mechanism.
   *
   * @returns The loaded roles data, or null if no roles are found
   * @throws {RolesPersistenceError} If the load operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const roles = await adapter.load();
   *   if (roles) {
   *     console.log(`Loaded ${roles.roles.length} roles`);
   *   } else {
   *     console.log("No roles found, using defaults");
   *   }
   * } catch (error) {
   *   if (error instanceof RolesPersistenceError) {
   *     console.error(`Load failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  load(): Promise<PersistedRolesSettingsData | null>;

  /**
   * Resets the persisted roles by removing them from storage.
   * After calling this method, subsequent calls to `load()` will return null
   * until new roles are saved.
   *
   * @throws {RolesPersistenceError} If the reset operation fails
   *
   * @example
   * ```typescript
   * try {
   *   await adapter.reset();
   *   console.log("Roles reset successfully");
   * } catch (error) {
   *   if (error instanceof RolesPersistenceError) {
   *     console.error(`Reset failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  reset(): Promise<void>;
}
