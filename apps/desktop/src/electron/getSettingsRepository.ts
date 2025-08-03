import { SettingsRepository } from "@fishbowl-ai/shared";

// Repository instance shared across the application
let repository: SettingsRepository | null = null;

/**
 * Settings repository manager providing get and set functionality.
 * Eliminates the need for globalThis pattern while maintaining single export.
 */
export const settingsRepositoryManager = {
  /**
   * Set the settings repository instance.
   * Called during application initialization in main.ts.
   *
   * @param repo The settings repository instance to set
   */
  set(repo: SettingsRepository): void {
    repository = repo;
  },

  /**
   * Get the settings repository instance.
   * Used by IPC handlers and other main process components.
   *
   * @returns The settings repository instance
   * @throws {Error} If repository is not initialized
   */
  get(): SettingsRepository {
    if (!repository) {
      throw new Error("Settings repository not initialized");
    }
    return repository;
  },
};
