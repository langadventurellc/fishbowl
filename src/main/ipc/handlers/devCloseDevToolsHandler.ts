import { BrowserWindow } from 'electron';

export const devCloseDevToolsHandler = (): void => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.webContents.closeDevTools();
  }
};
