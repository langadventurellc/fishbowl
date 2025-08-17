import type { PersistedPersonalitiesSettingsData } from "@fishbowl-ai/shared";
import {
  PersonalitiesPersistenceAdapter,
  PersonalitiesPersistenceError,
} from "@fishbowl-ai/ui-shared";

/**
 * Desktop implementation of PersonalitiesPersistenceAdapter that uses Electron IPC
 * to communicate with the main process for file operations.
 *
 * This adapter provides secure file operations by delegating all I/O to the main
 * process through established IPC channels, following Electron security best practices.
 */
export class DesktopPersonalitiesAdapter
  implements PersonalitiesPersistenceAdapter
{
  async save(personalities: PersistedPersonalitiesSettingsData): Promise<void> {
    try {
      await window.electronAPI.personalities.save(personalities);
    } catch (error) {
      if (error instanceof PersonalitiesPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to save personalities";
      throw new PersonalitiesPersistenceError(message, "save", error);
    }
  }

  async load(): Promise<PersistedPersonalitiesSettingsData | null> {
    throw new Error("Method not implemented");
  }

  async reset(): Promise<void> {
    throw new Error("Method not implemented");
  }
}

export const desktopPersonalitiesAdapter = new DesktopPersonalitiesAdapter();
