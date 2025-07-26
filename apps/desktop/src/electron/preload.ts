import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI } from "../types/electron";

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
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
