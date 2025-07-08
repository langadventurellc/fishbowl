'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.setupIpcHandlers = void 0;
const electron_1 = require('electron');
const fs_1 = require('fs');
const path_1 = require('path');
const os_1 = require('os');
// Configuration file path
const CONFIG_FILE = (0, path_1.join)(electron_1.app.getPath('userData'), 'config.json');
// Default configuration
const DEFAULT_CONFIG = {
  theme: 'system',
  windowState: {
    width: 1200,
    height: 800,
    isMaximized: false,
    isMinimized: false,
    isFullscreen: false,
  },
  devTools: electron_1.app.isPackaged ? false : true,
  autoUpdater: true,
  telemetry: false,
};
// In-memory config cache
let configCache = { ...DEFAULT_CONFIG };
// Load configuration from file
const loadConfig = () => {
  try {
    if ((0, fs_1.existsSync)(CONFIG_FILE)) {
      const configData = (0, fs_1.readFileSync)(CONFIG_FILE, 'utf8');
      const parsedConfig = JSON.parse(configData);
      configCache = { ...DEFAULT_CONFIG, ...parsedConfig };
    }
  } catch (error) {
    console.error('Failed to load config:', error);
    configCache = { ...DEFAULT_CONFIG };
  }
  return configCache;
};
// Save configuration to file
const saveConfig = config => {
  try {
    (0, fs_1.writeFileSync)(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    configCache = config;
  } catch (error) {
    console.error('Failed to save config:', error);
  }
};
// Initialize config
loadConfig();
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
  // System information
  electron_1.ipcMain.handle('system:getInfo', () => {
    const memoryUsage = process.memoryUsage();
    return {
      platform: (0, os_1.platform)(),
      arch: (0, os_1.arch)(),
      version: (0, os_1.version)(),
      appVersion: electron_1.app.getVersion(),
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
      },
    };
  });
  electron_1.ipcMain.handle('system:platform', () => {
    return (0, os_1.platform)();
  });
  electron_1.ipcMain.handle('system:arch', () => {
    return (0, os_1.arch)();
  });
  electron_1.ipcMain.handle('system:version', () => {
    return (0, os_1.version)();
  });
  // Configuration management
  electron_1.ipcMain.handle('config:get', (_event, key) => {
    return configCache[key];
  });
  electron_1.ipcMain.handle('config:set', (_event, key, value) => {
    const newConfig = { ...configCache, [key]: value };
    saveConfig(newConfig);
  });
  // Theme management
  electron_1.ipcMain.handle('theme:get', () => {
    return configCache.theme;
  });
  electron_1.ipcMain.handle('theme:set', (_event, theme) => {
    const newConfig = { ...configCache, theme };
    saveConfig(newConfig);
    // Broadcast theme change to all windows
    electron_1.BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('theme:change', theme);
    });
  });
  // Development tools
  electron_1.ipcMain.handle('dev:isDev', () => {
    return !electron_1.app.isPackaged;
  });
  electron_1.ipcMain.handle('dev:openDevTools', () => {
    const window = electron_1.BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.openDevTools();
    }
  });
  electron_1.ipcMain.handle('dev:closeDevTools', () => {
    const window = electron_1.BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.closeDevTools();
    }
  });
  // Error handling is already built into individual handlers
};
exports.setupIpcHandlers = setupIpcHandlers;
