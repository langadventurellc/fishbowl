import { BrowserWindow } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import type { ConfigValue } from '../../../shared/types';

export const themeSetHandler =
  (configCache: ConfigValue, saveConfig: (config: ConfigValue) => void) =>
  (_event: IpcMainInvokeEvent, theme: 'light' | 'dark' | 'system'): void => {
    const newConfig = { ...configCache, theme };
    saveConfig(newConfig);

    // Broadcast theme change to all windows
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('theme:change', theme);
    });
  };
