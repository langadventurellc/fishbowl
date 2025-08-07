import { LlmStorageService } from "./services/LlmStorageService.js";

let storageService: LlmStorageService | null = null;

/**
 * LLM storage service manager providing get and set functionality.
 * Follows the pattern established by settingsRepositoryManager.
 */
export const llmStorageServiceManager = {
  /**
   * Set the LLM storage service instance.
   * Called during application initialization in main.ts.
   *
   * @param service The LLM storage service instance to set
   */
  set(service: LlmStorageService): void {
    storageService = service;
  },

  /**
   * Get the LLM storage service instance.
   * Used by IPC handlers and other main process components.
   *
   * @returns The LLM storage service instance
   * @throws {Error} If service is not initialized
   */
  get(): LlmStorageService {
    if (!storageService) {
      throw new Error("LLM storage service not initialized");
    }
    return storageService;
  },
};
