import { ipcMain } from "electron";
import {
  SETTINGS_CHANNELS,
  type SettingsLoadResponse,
  type SettingsSaveRequest,
  type SettingsSaveResponse,
  type SettingsResetRequest,
  type SettingsResetResponse,
  type PersistedSettingsData,
} from "../shared/ipc/index";
import { serializeError } from "./utils/errorSerialization";

// Placeholder settings data for development/testing
const placeholderSettings: PersistedSettingsData = {
  schemaVersion: "1.0.0",
  general: {
    responseDelay: 2000,
    maximumMessages: 50,
    maximumWaitTime: 30000,
    defaultMode: "manual",
    maximumAgents: 4,
    checkUpdates: true,
  },
  appearance: {
    theme: "system",
    showTimestamps: "hover",
    showActivityTime: true,
    compactList: false,
    fontSize: 14,
    messageSpacing: "normal",
  },
  advanced: {
    debugLogging: false,
    experimentalFeatures: false,
  },
  lastUpdated: new Date().toISOString(),
};

// In-memory settings store for placeholder implementation
let currentSettings: PersistedSettingsData = { ...placeholderSettings };

/**
 * Sets up IPC handlers for settings operations
 * Registers handlers for load, save, and reset operations using placeholder logic
 */
export function setupSettingsHandlers(): void {
  // Handler for loading settings
  ipcMain.handle(
    SETTINGS_CHANNELS.LOAD,
    async (_event): Promise<SettingsLoadResponse> => {
      try {
        console.log("Loading settings");

        // Placeholder: Return current in-memory settings
        const settings = currentSettings;

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

        // Placeholder: Update in-memory settings
        // Simple merge for placeholder - merge all provided settings
        currentSettings = {
          ...currentSettings,
          ...request.settings,
        };

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

        // Placeholder: Reset to default settings
        // Simple reset for placeholder - always reset all settings
        currentSettings = { ...placeholderSettings };

        console.log("Settings reset successfully", {
          section: request?.section,
        });
        return { success: true, data: currentSettings };
      } catch (error) {
        console.error("Failed to reset settings", error);
        return { success: false, error: serializeError(error) };
      }
    },
  );

  console.log("Settings IPC handlers initialized");
}
