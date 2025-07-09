import { app, ipcMain } from 'electron';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { ConfigValue } from '../../shared/types';
import {
  // App handlers
  appGetVersionHandler,
  // Configuration handlers
  configGetHandler,
  configSetHandler,
  dbAgentsCreateHandler,
  dbAgentsDeleteHandler,
  dbAgentsGetHandler,
  // Database agent handlers
  dbAgentsListHandler,
  dbAgentsUpdateHandler,
  dbConversationAgentsAddHandler,
  // Database conversation-agent relationship handlers
  dbConversationAgentsListHandler,
  dbConversationAgentsRemoveHandler,
  dbConversationsCreateHandler,
  dbConversationsDeleteHandler,
  dbConversationsGetHandler,
  // Database conversation handlers
  dbConversationsListHandler,
  dbConversationsUpdateHandler,
  dbMessagesCreateHandler,
  dbMessagesDeleteHandler,
  dbMessagesGetHandler,
  // Database message handlers
  dbMessagesListHandler,
  // Database transaction handlers
  dbTransactionsCreateConversationWithAgentsHandler,
  dbTransactionsCreateMessagesBatchHandler,
  dbTransactionsDeleteConversationCascadeHandler,
  dbTransactionsTransferMessagesHandler,
  devCloseDevToolsHandler,
  // Development handlers
  devIsDevHandler,
  devOpenDevToolsHandler,
  secureCredentialsDeleteHandler,
  // Secure storage handlers
  secureCredentialsGetHandler,
  secureCredentialsListHandler,
  secureCredentialsSetHandler,
  secureKeytarDeleteHandler,
  secureKeytarGetHandler,
  secureKeytarSetHandler,
  systemArchHandler,
  // System handlers
  systemGetInfoHandler,
  systemPlatformHandler,
  systemVersionHandler,
  // Theme handlers
  themeGetHandler,
  themeSetHandler,
  windowCloseHandler,
  windowMaximizeHandler,
  // Window handlers
  windowMinimizeHandler,
} from './handlers/index';

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
  ipcMain.handle('window:minimize', windowMinimizeHandler);
  ipcMain.handle('window:maximize', windowMaximizeHandler);
  ipcMain.handle('window:close', windowCloseHandler);

  // Application info
  ipcMain.handle('app:getVersion', appGetVersionHandler);

  // System information
  ipcMain.handle('system:getInfo', systemGetInfoHandler);
  ipcMain.handle('system:platform', systemPlatformHandler);
  ipcMain.handle('system:arch', systemArchHandler);
  ipcMain.handle('system:version', systemVersionHandler);

  // Configuration management
  ipcMain.handle('config:get', configGetHandler(configCache));
  ipcMain.handle('config:set', configSetHandler(configCache, saveConfig));

  // Theme management
  ipcMain.handle('theme:get', themeGetHandler(configCache));
  ipcMain.handle('theme:set', themeSetHandler(configCache, saveConfig));

  // Development tools
  ipcMain.handle('dev:isDev', devIsDevHandler);
  ipcMain.handle('dev:openDevTools', devOpenDevToolsHandler);
  ipcMain.handle('dev:closeDevTools', devCloseDevToolsHandler);

  // Secure storage handlers
  ipcMain.handle('secure:credentials:get', secureCredentialsGetHandler);
  ipcMain.handle('secure:credentials:set', secureCredentialsSetHandler);
  ipcMain.handle('secure:credentials:delete', secureCredentialsDeleteHandler);
  ipcMain.handle('secure:credentials:list', secureCredentialsListHandler);
  ipcMain.handle('secure:keytar:get', secureKeytarGetHandler);
  ipcMain.handle('secure:keytar:set', secureKeytarSetHandler);
  ipcMain.handle('secure:keytar:delete', secureKeytarDeleteHandler);

  // Database IPC handlers

  // Agent operations
  ipcMain.handle('db:agents:list', dbAgentsListHandler);
  ipcMain.handle('db:agents:get', dbAgentsGetHandler);
  ipcMain.handle('db:agents:create', dbAgentsCreateHandler);
  ipcMain.handle('db:agents:update', dbAgentsUpdateHandler);
  ipcMain.handle('db:agents:delete', dbAgentsDeleteHandler);

  // Conversation operations
  ipcMain.handle('db:conversations:list', dbConversationsListHandler);
  ipcMain.handle('db:conversations:get', dbConversationsGetHandler);
  ipcMain.handle('db:conversations:create', dbConversationsCreateHandler);
  ipcMain.handle('db:conversations:update', dbConversationsUpdateHandler);
  ipcMain.handle('db:conversations:delete', dbConversationsDeleteHandler);

  // Message operations
  ipcMain.handle('db:messages:list', dbMessagesListHandler);
  ipcMain.handle('db:messages:get', dbMessagesGetHandler);
  ipcMain.handle('db:messages:create', dbMessagesCreateHandler);
  ipcMain.handle('db:messages:delete', dbMessagesDeleteHandler);

  // Conversation-Agent relationship operations
  ipcMain.handle('db:conversation-agents:list', dbConversationAgentsListHandler);
  ipcMain.handle('db:conversation-agents:add', dbConversationAgentsAddHandler);
  ipcMain.handle('db:conversation-agents:remove', dbConversationAgentsRemoveHandler);

  // Transaction-based complex operations
  ipcMain.handle(
    'db:transactions:create-conversation-with-agents',
    dbTransactionsCreateConversationWithAgentsHandler,
  );
  ipcMain.handle('db:transactions:create-messages-batch', dbTransactionsCreateMessagesBatchHandler);
  ipcMain.handle(
    'db:transactions:delete-conversation-cascade',
    dbTransactionsDeleteConversationCascadeHandler,
  );
  ipcMain.handle('db:transactions:transfer-messages', dbTransactionsTransferMessagesHandler);

  // Error handling is already built into individual handlers
};
