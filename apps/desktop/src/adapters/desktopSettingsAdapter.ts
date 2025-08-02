import type { PersistedSettingsData } from "@fishbowl-ai/shared";
import {
  SettingsPersistenceAdapter,
  SettingsPersistenceError,
} from "@fishbowl-ai/ui-shared";

export class DesktopSettingsAdapter implements SettingsPersistenceAdapter {
  async save(settings: PersistedSettingsData): Promise<void> {
    try {
      await window.electronAPI.settings.save(settings);
    } catch (error) {
      if (error instanceof SettingsPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to save settings";
      throw new SettingsPersistenceError(message, "save", error);
    }
  }

  async load(): Promise<PersistedSettingsData | null> {
    try {
      const data = await window.electronAPI.settings.load();
      return data;
    } catch (error) {
      // Check if this is a "no settings found" case and return null
      if (
        error instanceof Error &&
        error.message.includes("Failed to load settings")
      ) {
        return null;
      }
      if (error instanceof SettingsPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to load settings";
      throw new SettingsPersistenceError(message, "load", error);
    }
  }

  async reset(): Promise<void> {
    try {
      // Call reset but ignore the returned data since interface expects void
      await window.electronAPI.settings.reset();
    } catch (error) {
      if (error instanceof SettingsPersistenceError) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : "Failed to reset settings";
      throw new SettingsPersistenceError(message, "reset", error);
    }
  }
}

export const desktopSettingsAdapter = new DesktopSettingsAdapter();
