import { LlmConfigService } from "./services/LlmConfigService.js";

let configService: LlmConfigService | null = null;

/**
 * LLM configuration service manager providing get and set functionality.
 * Follows the pattern established by llmStorageServiceManager.
 */
export const llmConfigServiceManager = {
  /**
   * Set the LLM configuration service instance.
   * Called during application initialization in main.ts.
   *
   * @param service The LLM configuration service instance to set
   */
  set(service: LlmConfigService): void {
    configService = service;
  },

  /**
   * Get the LLM configuration service instance.
   * Used by IPC handlers and other main process components.
   *
   * @returns The LLM configuration service instance
   * @throws {Error} If service is not initialized
   */
  get(): LlmConfigService {
    if (!configService) {
      throw new Error("LLM configuration service not initialized");
    }
    return configService;
  },
};
