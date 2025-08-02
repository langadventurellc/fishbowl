import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI } from "../types/electron";
import { SETTINGS_CHANNELS } from "../shared/ipc/constants";
import type {
  SettingsLoadResponse,
  SettingsSaveRequest,
  SettingsSaveResponse,
  SettingsResetResponse,
} from "../shared/ipc/index";
import type { PersistedSettingsData } from "@fishbowl-ai/shared";
import type { SettingsCategory } from "@fishbowl-ai/ui-shared";

const electronAPI: ElectronAPI = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  onOpenSettings: (callback: () => void) => {
    try {
      // Create a wrapped callback to prevent event object exposure
      const wrappedCallback = () => {
        try {
          callback();
        } catch (error) {
          console.error("Error in settings callback:", error);
        }
      };

      // Register the IPC listener with the wrapped callback
      ipcRenderer.on("open-settings", wrappedCallback);

      // Return cleanup function for memory management
      return () => {
        try {
          ipcRenderer.removeListener("open-settings", wrappedCallback);
        } catch (error) {
          console.error("Error removing IPC listener:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up IPC listener:", error);
      // Return no-op cleanup function if setup fails
      return () => {};
    }
  },
  removeAllListeners: (channel: string) => {
    try {
      ipcRenderer.removeAllListeners(channel);
    } catch (error) {
      console.error(
        `Error removing all listeners for channel ${channel}:`,
        error,
      );
    }
  },
  settings: {
    load: async (): Promise<PersistedSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          SETTINGS_CHANNELS.LOAD,
        )) as SettingsLoadResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to load settings");
        }
        return response.data!;
      } catch (error) {
        console.error("Error loading settings:", error);
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    save: async (
      settings: Partial<PersistedSettingsData>,
      section?: SettingsCategory,
    ): Promise<void> => {
      try {
        const request: SettingsSaveRequest = { settings, section };
        const response = (await ipcRenderer.invoke(
          SETTINGS_CHANNELS.SAVE,
          request,
        )) as SettingsSaveResponse;
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to save settings");
        }
      } catch (error) {
        console.error("Error saving settings:", error);
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
    reset: async (): Promise<PersistedSettingsData> => {
      try {
        const response = (await ipcRenderer.invoke(
          SETTINGS_CHANNELS.RESET,
        )) as SettingsResetResponse;
        if (!response.success) {
          throw new Error(
            response.error?.message || "Failed to reset settings",
          );
        }
        return response.data!;
      } catch (error) {
        console.error("Error resetting settings:", error);
        throw error instanceof Error
          ? error
          : new Error("Failed to communicate with main process");
      }
    },
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
