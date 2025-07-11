import { app, ipcMain } from 'electron';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { ConfigValue } from '../../shared/types';
import { errorRecoveryManager } from '../error-recovery/errorRecoveryManagerInstance';
import { ipcPerformanceManager } from '../performance/ipcPerformanceManagerInstance';
import { securityManager } from '../security/securityManagerInstance';
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
  // Database backup handlers
  dbBackupCleanupHandler,
  dbBackupCreateHandler,
  dbBackupDeleteHandler,
  dbBackupListHandler,
  dbBackupRestoreHandler,
  dbBackupStatsHandler,
  dbBackupValidateHandler,
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
  dbMessagesUpdateActiveStateHandler,
  dbMessagesToggleActiveStateHandler,
  // Database transaction handlers
  dbTransactionsCreateConversationWithAgentsHandler,
  dbTransactionsCreateMessagesBatchHandler,
  dbTransactionsDeleteConversationCascadeHandler,
  dbTransactionsTransferMessagesHandler,
  devCloseDevToolsHandler,
  // Development handlers
  devIsDevHandler,
  devOpenDevToolsHandler,
  // Database performance handlers
  registerDatabasePerformanceHandlers,
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
 * Wraps an IPC handler with performance monitoring and error recovery
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  channel: string,
  handler: T,
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return ipcPerformanceManager.trackCall(channel, async () => {
      return errorRecoveryManager.executeWithRecovery(
        async (): Promise<Awaited<ReturnType<T>>> => {
          const result = handler(...args) as ReturnType<T>;
          // Handle both sync and async functions
          return Promise.resolve(result);
        },
        { channel },
      );
    }) as Promise<Awaited<ReturnType<T>>>;
  };
};

/**
 * Set up IPC handlers for main process communication
 */
// eslint-disable-next-line statement-count/function-statement-count-warn
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

  // Database IPC handlers with performance monitoring

  // Agent operations
  ipcMain.handle(
    'db:agents:list',
    withPerformanceMonitoring('db:agents:list', dbAgentsListHandler),
  );
  ipcMain.handle('db:agents:get', withPerformanceMonitoring('db:agents:get', dbAgentsGetHandler));
  ipcMain.handle(
    'db:agents:create',
    withPerformanceMonitoring('db:agents:create', dbAgentsCreateHandler),
  );
  ipcMain.handle(
    'db:agents:update',
    withPerformanceMonitoring('db:agents:update', dbAgentsUpdateHandler),
  );
  ipcMain.handle(
    'db:agents:delete',
    withPerformanceMonitoring('db:agents:delete', dbAgentsDeleteHandler),
  );

  // Conversation operations
  ipcMain.handle(
    'db:conversations:list',
    withPerformanceMonitoring('db:conversations:list', dbConversationsListHandler),
  );
  ipcMain.handle(
    'db:conversations:get',
    withPerformanceMonitoring('db:conversations:get', dbConversationsGetHandler),
  );
  ipcMain.handle(
    'db:conversations:create',
    withPerformanceMonitoring('db:conversations:create', dbConversationsCreateHandler),
  );
  ipcMain.handle(
    'db:conversations:update',
    withPerformanceMonitoring('db:conversations:update', dbConversationsUpdateHandler),
  );
  ipcMain.handle(
    'db:conversations:delete',
    withPerformanceMonitoring('db:conversations:delete', dbConversationsDeleteHandler),
  );

  // Message operations
  ipcMain.handle(
    'db:messages:list',
    withPerformanceMonitoring('db:messages:list', dbMessagesListHandler),
  );
  ipcMain.handle(
    'db:messages:get',
    withPerformanceMonitoring('db:messages:get', dbMessagesGetHandler),
  );
  ipcMain.handle(
    'db:messages:create',
    withPerformanceMonitoring('db:messages:create', dbMessagesCreateHandler),
  );
  ipcMain.handle(
    'db:messages:delete',
    withPerformanceMonitoring('db:messages:delete', dbMessagesDeleteHandler),
  );
  ipcMain.handle(
    'db:messages:update-active-state',
    withPerformanceMonitoring(
      'db:messages:update-active-state',
      dbMessagesUpdateActiveStateHandler,
    ),
  );
  ipcMain.handle(
    'db:messages:toggle-active-state',
    withPerformanceMonitoring(
      'db:messages:toggle-active-state',
      dbMessagesToggleActiveStateHandler,
    ),
  );

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

  // Database backup operations
  ipcMain.handle(
    'db:backup:create',
    withPerformanceMonitoring('db:backup:create', dbBackupCreateHandler),
  );
  ipcMain.handle(
    'db:backup:restore',
    withPerformanceMonitoring('db:backup:restore', dbBackupRestoreHandler),
  );
  ipcMain.handle(
    'db:backup:list',
    withPerformanceMonitoring('db:backup:list', dbBackupListHandler),
  );
  ipcMain.handle(
    'db:backup:delete',
    withPerformanceMonitoring('db:backup:delete', dbBackupDeleteHandler),
  );
  ipcMain.handle(
    'db:backup:validate',
    withPerformanceMonitoring('db:backup:validate', dbBackupValidateHandler),
  );
  ipcMain.handle(
    'db:backup:cleanup',
    withPerformanceMonitoring('db:backup:cleanup', dbBackupCleanupHandler),
  );
  ipcMain.handle(
    'db:backup:stats',
    withPerformanceMonitoring('db:backup:stats', dbBackupStatsHandler),
  );

  // Register all performance monitoring handlers (database, IPC, system)
  registerDatabasePerformanceHandlers();

  // Error recovery and graceful degradation handlers
  ipcMain.handle('errorRecovery:getSystemStatus', () => {
    return errorRecoveryManager.getSystemStatus();
  });

  ipcMain.handle('errorRecovery:performHealthCheck', async () => {
    return await errorRecoveryManager.performHealthCheck();
  });

  ipcMain.handle('errorRecovery:resetRecovery', (_, channel?: string) => {
    errorRecoveryManager.resetRecovery(channel);
    return { success: true };
  });

  ipcMain.handle('errorRecovery:forceServiceRecovery', (_, serviceName: string) => {
    errorRecoveryManager.forceServiceRecovery(serviceName);
    return { success: true };
  });

  // Security audit and validation handlers
  ipcMain.handle('security:performAudit', async () => {
    return await securityManager.performSecurityAudit();
  });

  ipcMain.handle('security:runValidation', async () => {
    return await securityManager.runSecurityValidation();
  });

  ipcMain.handle('security:runValidationByCategory', async (_, category: string) => {
    return await securityManager.runValidationByCategory(category);
  });

  ipcMain.handle('security:runSingleTest', async (_, testId: string) => {
    return await securityManager.runSingleValidationTest(testId);
  });

  ipcMain.handle('security:performFullScan', async () => {
    return await securityManager.performFullSecurityScan();
  });

  ipcMain.handle('security:getStatus', () => {
    return securityManager.getSecurityStatus();
  });

  ipcMain.handle('security:enableAudits', () => {
    securityManager.enableAutomaticAudits();
    return { success: true };
  });

  ipcMain.handle('security:disableAudits', () => {
    securityManager.disableAutomaticAudits();
    return { success: true };
  });

  // Error handling is already built into individual handlers
};
