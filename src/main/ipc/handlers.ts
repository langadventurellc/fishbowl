import { app, ipcMain, BrowserWindow } from 'electron';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { arch, platform, version } from 'os';
import type {
  SystemInfo,
  ConfigKey,
  ConfigValue,
  AiProvider,
  CredentialInfo,
} from '../../shared/types';
import { credentialManager } from '../secure-storage';
import { SecureStorageError } from '../../shared/types/errors';

// Configuration file path
const CONFIG_FILE = join(app.getPath('userData'), 'config.json');

// Default configuration
const DEFAULT_CONFIG: ConfigValue = {
  theme: 'system',
  windowState: {
    width: 1200,
    height: 800,
    isMaximized: false,
    isMinimized: false,
    isFullscreen: false,
  },
  devTools: app.isPackaged ? false : true,
  autoUpdater: true,
  telemetry: false,
};

// In-memory config cache
let configCache: ConfigValue = { ...DEFAULT_CONFIG };

// Load configuration from file
const loadConfig = (): ConfigValue => {
  try {
    if (existsSync(CONFIG_FILE)) {
      const configData = readFileSync(CONFIG_FILE, 'utf8');
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
const saveConfig = (config: ConfigValue): void => {
  try {
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
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

  // System information
  ipcMain.handle('system:getInfo', (): SystemInfo => {
    const memoryUsage = process.memoryUsage();

    return {
      platform: platform(),
      arch: arch(),
      version: version(),
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
      },
    };
  });

  ipcMain.handle('system:platform', () => {
    return platform();
  });

  ipcMain.handle('system:arch', () => {
    return arch();
  });

  ipcMain.handle('system:version', () => {
    return version();
  });

  // Configuration management
  ipcMain.handle('config:get', (_event, key: ConfigKey): ConfigValue[ConfigKey] => {
    return configCache[key];
  });

  ipcMain.handle('config:set', (_event, key: ConfigKey, value: ConfigValue[ConfigKey]): void => {
    const newConfig = { ...configCache, [key]: value };
    saveConfig(newConfig);
  });

  // Theme management
  ipcMain.handle('theme:get', () => {
    return configCache.theme;
  });

  ipcMain.handle('theme:set', (_event, theme: 'light' | 'dark' | 'system') => {
    const newConfig = { ...configCache, theme };
    saveConfig(newConfig);

    // Broadcast theme change to all windows
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('theme:change', theme);
    });
  });

  // Development tools
  ipcMain.handle('dev:isDev', () => {
    return !app.isPackaged;
  });

  ipcMain.handle('dev:openDevTools', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.openDevTools();
    }
  });

  ipcMain.handle('dev:closeDevTools', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      window.webContents.closeDevTools();
    }
  });

  // Secure storage handlers
  ipcMain.handle(
    'secure:credentials:get',
    async (_event, provider: AiProvider): Promise<CredentialInfo | null> => {
      try {
        return await credentialManager.getCredential(provider);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to get credentials for provider ${provider}`,
          'getCredentials',
          'secure:credentials',
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'secure:credentials:set',
    async (
      _event,
      provider: AiProvider,
      apiKey: string,
      metadata?: Record<string, unknown>,
    ): Promise<void> => {
      try {
        await credentialManager.setCredential(provider, apiKey, metadata);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to set credentials for provider ${provider}`,
          'setCredentials',
          'secure:credentials',
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'secure:credentials:delete',
    async (_event, provider: AiProvider): Promise<void> => {
      try {
        await credentialManager.deleteCredential(provider);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to delete credentials for provider ${provider}`,
          'deleteCredentials',
          'secure:credentials',
          error,
        );
      }
    },
  );

  ipcMain.handle('secure:credentials:list', async (): Promise<CredentialInfo[]> => {
    try {
      return await credentialManager.listCredentials();
    } catch (error) {
      throw new SecureStorageError(
        'Failed to list credentials',
        'listCredentials',
        'secure:credentials',
        error,
      );
    }
  });

  ipcMain.handle(
    'secure:keytar:get',
    async (_event, service: string, account: string): Promise<string | null> => {
      try {
        return await credentialManager.storage.get(service, account);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to get keytar value for ${service}:${account}`,
          'get',
          service,
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'secure:keytar:set',
    async (_event, service: string, account: string, password: string): Promise<void> => {
      try {
        await credentialManager.storage.set(service, account, password);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to set keytar value for ${service}:${account}`,
          'set',
          service,
          error,
        );
      }
    },
  );

  ipcMain.handle(
    'secure:keytar:delete',
    async (_event, service: string, account: string): Promise<void> => {
      try {
        await credentialManager.storage.delete(service, account);
      } catch (error) {
        throw new SecureStorageError(
          `Failed to delete keytar value for ${service}:${account}`,
          'delete',
          service,
          error,
        );
      }
    },
  );

  // Error handling is already built into individual handlers
};
