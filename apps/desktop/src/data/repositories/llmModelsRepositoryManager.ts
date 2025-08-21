import { LlmModelsRepository } from "./LlmModelsRepository";

// Repository instance shared across the application
let repository: LlmModelsRepository | null = null;

/**
 * LLM models repository manager providing singleton access to LlmModelsRepository.
 * Follows the same pattern as personalitiesRepositoryManager for consistency.
 */
class LlmModelsRepositoryManager {
  /**
   * Initialize the LLM models repository with the provided data path.
   * Called during application initialization in main.ts.
   *
   * @param dataPath - Path to the directory where llmModels.json should be stored
   * @throws {Error} If repository is already initialized
   */
  initialize(dataPath: string): void {
    if (repository) {
      throw new Error("LLM models repository already initialized");
    }
    repository = new LlmModelsRepository(dataPath);
  }

  /**
   * Get the initialized LLM models repository instance.
   *
   * @returns The LLM models repository instance
   * @throws {Error} If repository is not initialized
   */
  get(): LlmModelsRepository {
    if (!repository) {
      throw new Error("LLM models repository not initialized");
    }
    return repository;
  }

  /**
   * Reset the repository manager to uninitialized state.
   * Used primarily for testing to ensure clean state between tests.
   */
  reset(): void {
    repository = null;
  }
}

export const llmModelsRepositoryManager = new LlmModelsRepositoryManager();
