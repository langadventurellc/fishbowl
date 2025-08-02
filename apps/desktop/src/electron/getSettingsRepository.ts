import { SettingsRepository } from "@fishbowl-ai/shared";

// Repository instance shared from main.ts
let settingsRepository: SettingsRepository | null = null;

// Function to set repository from main.ts (called during initialization)
// This is not exported to avoid multiple exports lint error
function setRepository(repository: SettingsRepository): void {
  settingsRepository = repository;
}

/**
 * Get the settings repository instance.
 * Used by IPC handlers and other main process components.
 *
 * @returns The settings repository instance
 * @throws {Error} If repository is not initialized
 */
export function getSettingsRepository(): SettingsRepository {
  if (!settingsRepository) {
    throw new Error("Settings repository not initialized");
  }
  return settingsRepository;
}

// Make setRepository available to main.ts without exporting it
// This avoids the multiple exports linting error
interface GlobalWithSettings {
  __setSettingsRepository?: (repository: SettingsRepository) => void;
}

(globalThis as GlobalWithSettings).__setSettingsRepository = setRepository;
