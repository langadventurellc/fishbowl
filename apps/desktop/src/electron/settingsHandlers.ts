import { ipcMain } from "electron";
import {
  SETTINGS_CHANNELS,
  type SettingsLoadResponse,
  type SettingsSaveRequest,
  type SettingsSaveResponse,
  type SettingsResetRequest,
  type SettingsResetResponse,
} from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";
import { getSettingsRepository } from "./getSettingsRepository";
import { PersistedSettingsData } from "@fishbowl-ai/shared";

/**
 * Sets up IPC handlers for settings operations
 * Registers handlers for load, save, and reset operations using SettingsRepository
 */
export function setupSettingsHandlers(): void {
  // Handler for loading settings
  ipcMain.handle(
    SETTINGS_CHANNELS.LOAD,
    async (_event): Promise<SettingsLoadResponse> => {
      try {
        console.log("Loading settings");

        const repository = getSettingsRepository();
        const settings = await repository.loadSettings();

        console.log("Settings loaded successfully");
        return { success: true, data: settings };
      } catch (error) {
        console.error("Failed to load settings", error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for saving settings
  ipcMain.handle(
    SETTINGS_CHANNELS.SAVE,
    async (
      _event,
      request: SettingsSaveRequest,
    ): Promise<SettingsSaveResponse> => {
      try {
        console.log("Saving settings", { section: request.section });

        const repository = getSettingsRepository();
        await repository.saveSettings(request.settings);

        console.log("Settings saved successfully", {
          section: request.section,
        });
        return { success: true };
      } catch (error) {
        console.error("Failed to save settings", error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  // Handler for resetting settings
  ipcMain.handle(
    SETTINGS_CHANNELS.RESET,
    async (
      _event,
      request?: SettingsResetRequest,
    ): Promise<SettingsResetResponse> => {
      try {
        console.log("Resetting settings", { section: request?.section });

        const repository = getSettingsRepository();

        // Reset by saving empty object (repository will merge with defaults)
        await repository.saveSettings({} as PersistedSettingsData);

        // Load and return the reset settings
        const settings = await repository.loadSettings();

        console.log("Settings reset successfully", {
          section: request?.section,
        });
        return { success: true, data: settings };
      } catch (error) {
        console.error("Failed to reset settings", error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  console.log("Settings IPC handlers initialized");
}
