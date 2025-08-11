import { RolesRepository } from "./RolesRepository";

// Repository instance shared across the application
let repository: RolesRepository | null = null;

/**
 * Roles repository manager providing singleton access to RolesRepository.
 * Follows the same pattern as settingsRepositoryManager for consistency.
 */
class RolesRepositoryManager {
  /**
   * Initialize the roles repository with the provided data path.
   * Called during application initialization in main.ts.
   *
   * @param dataPath Path to the user data directory for roles.json
   * @throws {Error} If repository is already initialized
   */
  initialize(dataPath: string): void {
    if (repository) {
      throw new Error("Roles repository already initialized");
    }
    repository = new RolesRepository(dataPath);
  }

  /**
   * Get the roles repository instance.
   * Used by IPC handlers and other main process components.
   *
   * @returns The roles repository instance
   * @throws {Error} If repository is not initialized
   */
  get(): RolesRepository {
    if (!repository) {
      throw new Error("Roles repository not initialized");
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

export const rolesRepositoryManager = new RolesRepositoryManager();
