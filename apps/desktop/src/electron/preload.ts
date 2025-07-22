import { contextBridge } from 'electron';

export type ElectronAPI = {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
};

const electronAPI: ElectronAPI = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}