import { app, ipcMain, BrowserWindow } from 'electron';

/**
 * Set up IPC handlers for main process communication
 */
export const setupIpcHandlers = (): void => {
  // Window controls
  ipcMain.handle('window:minimize', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.minimize();
    }
  });

  ipcMain.handle('window:maximize', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.handle('window:close', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.close();
    }
  });

  // Application info
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });
};
