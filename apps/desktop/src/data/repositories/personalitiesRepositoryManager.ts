import { PersonalitiesRepository } from "./PersonalitiesRepository";

// Repository instance shared across the application
let repository: PersonalitiesRepository | null = null;

/**
 * Personalities repository manager providing singleton access to PersonalitiesRepository.
 * Follows the same pattern as rolesRepositoryManager for consistency.
 */
class PersonalitiesRepositoryManager {
  /**
   * Initialize the personalities repository with the provided data path.
   * Called during application initialization in main.ts.
   *
   * @param dataPath Path to the user data directory for personalities.json
   * @throws {Error} If repository is already initialized
   */
  initialize(dataPath: string): void {
    if (repository) {
      throw new Error("Personalities repository already initialized");
    }
    repository = new PersonalitiesRepository(dataPath);
  }

  /**
   * Get the personalities repository instance.
   * Used by IPC handlers and other main process components.
   *
   * @returns The personalities repository instance
   * @throws {Error} If repository is not initialized
   */
  get(): PersonalitiesRepository {
    if (!repository) {
      throw new Error("Personalities repository not initialized");
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

export const personalitiesRepositoryManager =
  new PersonalitiesRepositoryManager();
