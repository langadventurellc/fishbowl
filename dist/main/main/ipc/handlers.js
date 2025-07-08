'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.setupIpcHandlers = void 0;
const electron_1 = require('electron');
/**
 * Set up IPC handlers for main process communication
 */
const setupIpcHandlers = () => {
  // Window controls
  electron_1.ipcMain.handle('window:minimize', () => {
    const window = electron_1.BrowserWindow.getFocusedWindow();
    if (window) {
      window.minimize();
    }
  });
  electron_1.ipcMain.handle('window:maximize', () => {
    const window = electron_1.BrowserWindow.getFocusedWindow();
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });
  electron_1.ipcMain.handle('window:close', () => {
    const window = electron_1.BrowserWindow.getFocusedWindow();
    if (window) {
      window.close();
    }
  });
  // Application info
  electron_1.ipcMain.handle('app:getVersion', () => {
    return electron_1.app.getVersion();
  });
};
exports.setupIpcHandlers = setupIpcHandlers;
