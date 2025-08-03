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
import { PersistedSettingsData, createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  context: { metadata: { component: "settingsHandlers" } },
});

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
        logger.debug("Loading settings");

        const repository = getSettingsRepository();
        const settings = await repository.loadSettings();

        logger.debug("Settings loaded successfully");
        return { success: true, data: settings };
      } catch (error) {
        logger.error("Failed to load settings", error as Error);
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
        logger.debug("Saving settings", { section: request.section });

        const repository = getSettingsRepository();
        await repository.saveSettings(request.settings);

        logger.debug("Settings saved successfully", {
          section: request.section,
        });
        return { success: true };
      } catch (error) {
        logger.error("Failed to save settings", error as Error);
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
        logger.debug("Resetting settings", { section: request?.section });

        const repository = getSettingsRepository();

        // Reset by saving empty object (repository will merge with defaults)
        await repository.saveSettings({} as PersistedSettingsData);

        // Load and return the reset settings
        const settings = await repository.loadSettings();

        logger.debug("Settings reset successfully", {
          section: request?.section,
        });
        return { success: true, data: settings };
      } catch (error) {
        logger.error("Failed to reset settings", error as Error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  logger.info("Settings IPC handlers initialized");
}
