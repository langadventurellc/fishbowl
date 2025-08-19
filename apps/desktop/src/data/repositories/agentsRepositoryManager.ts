import { AgentsRepository } from "./AgentsRepository";

// Repository instance shared across the application
let repository: AgentsRepository | null = null;

/**
 * Agents repository manager providing singleton access to AgentsRepository.
 * Follows the same pattern as rolesRepositoryManager for consistency.
 */
class AgentsRepositoryManager {
  /**
   * Initialize the agents repository with the provided data path.
   * Called during application initialization in main.ts.
   *
   * @param dataPath Path to the user data directory for agents.json
   * @throws {Error} If repository is already initialized
   */
  initialize(dataPath: string): void {
    if (repository) {
      throw new Error("Agents repository already initialized");
    }
    repository = new AgentsRepository(dataPath);
  }

  /**
   * Get the agents repository instance.
   * Used by IPC handlers and other main process components.
   *
   * @returns The agents repository instance
   * @throws {Error} If repository is not initialized
   */
  get(): AgentsRepository {
    if (!repository) {
      throw new Error("Agents repository not initialized");
    }
    return repository;
  }

  /**
   * Reset the repository manager for testing purposes.
   * Clears the singleton instance.
   */
  reset(): void {
    repository = null;
  }
}

export const agentsRepositoryManager = new AgentsRepositoryManager();
