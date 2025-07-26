import { contextBridge, ipcRenderer } from "electron";
import type { ElectronAPI } from "../types/electron";

const electronAPI: ElectronAPI = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  onOpenSettings: (callback: () => void) =>
    ipcRenderer.on("open-settings", () => callback()),
  removeAllListeners: (channel: string) =>
    ipcRenderer.removeAllListeners(channel),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
