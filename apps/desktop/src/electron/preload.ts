import { contextBridge } from 'electron';
import type { ElectronAPI } from '../types/electron';

const electronAPI: ElectronAPI = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);