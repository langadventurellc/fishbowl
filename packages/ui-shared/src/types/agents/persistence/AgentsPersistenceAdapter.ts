import type { PersistedAgentsSettingsData } from "@fishbowl-ai/shared";

/**
 * Platform-agnostic interface for persisting agents configuration.
 *
 * Implementations of this interface handle the platform-specific details
 * of storing and retrieving agents data, while maintaining a consistent
 * API across desktop and mobile platforms.
 *
 * @example
 * ```typescript
 * const adapter: AgentsPersistenceAdapter = createDesktopAgentsAdapter();
 *
 * // Save agents
 * await adapter.save(agentsData);
 *
 * // Load agents
 * const agents = await adapter.load();
 *
 * // Reset to defaults
 * await adapter.reset();
 * ```
 */
export interface AgentsPersistenceAdapter {
  /**
   * Persists the provided agents data to the platform's storage mechanism.
   *
   * @param agents - The agents data to persist
   * @throws {AgentsPersistenceError} If the save operation fails
   *
   * @example
   * ```typescript
   * try {
   *   await adapter.save({
   *     schemaVersion: "1.0.0",
   *     lastUpdated: new Date().toISOString(),
   *     agents: [
   *       {
   *         id: "agent-1",
   *         name: "Assistant",
   *         model: "claude-3-sonnet",
   *         role: "role-1",
   *         personality: "personality-1",
   *         temperature: 0.7,
   *         maxTokens: 1000,
   *         topP: 1.0,
   *         systemPrompt: "You are a helpful assistant",
   *         createdAt: "2025-01-01T00:00:00.000Z",
   *         updatedAt: "2025-01-01T00:00:00.000Z"
   *       }
   *     ]
   *   });
   * } catch (error) {
   *   if (error instanceof AgentsPersistenceError) {
   *     console.error(`Save failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  save(agents: PersistedAgentsSettingsData): Promise<void>;

  /**
   * Loads the persisted agents data from the platform's storage mechanism.
   *
   * @returns The loaded agents data, or null if no agents are found
   * @throws {AgentsPersistenceError} If the load operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const agents = await adapter.load();
   *   if (agents) {
   *     console.log(`Loaded ${agents.agents.length} agents`);
   *   } else {
   *     console.log("No agents found, using defaults");
   *   }
   * } catch (error) {
   *   if (error instanceof AgentsPersistenceError) {
   *     console.error(`Load failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  load(): Promise<PersistedAgentsSettingsData | null>;

  /**
   * Resets the persisted agents by removing them from storage.
   * After calling this method, subsequent calls to `load()` will return null
   * until new agents are saved.
   *
   * @throws {AgentsPersistenceError} If the reset operation fails
   *
   * @example
   * ```typescript
   * try {
   *   await adapter.reset();
   *   console.log("Agents reset successfully");
   * } catch (error) {
   *   if (error instanceof AgentsPersistenceError) {
   *     console.error(`Reset failed: ${error.message}`);
   *   }
   * }
   * ```
   */
  reset(): Promise<void>;
}
