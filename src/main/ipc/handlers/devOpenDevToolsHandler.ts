import { BrowserWindow } from 'electron';

export const devOpenDevToolsHandler = (): void => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.webContents.openDevTools();
  }
};
