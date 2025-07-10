import { contextBridge, ipcRenderer } from 'electron';
import type { IpcChannels } from '../shared/types';
import { ipcPerformanceMonitor } from './performance-monitor';
import { preloadSecurityManager } from './security';
import { validateIpcArguments } from './validation';

// Helper function to create secure IPC wrapper with validation, performance monitoring, and security
const createSecureIpcWrapper = <T extends keyof IpcChannels>(channel: T): IpcChannels[T] => {
  return ((...args: Parameters<IpcChannels[T]>) => {
    // Security check
    const securityCheck = preloadSecurityManager.checkIpcSecurity(channel, args);
    if (!securityCheck.allowed) {
      return Promise.reject(new Error(`Security: ${securityCheck.reason}`));
    }

    // Validate and sanitize arguments
    const validation = validateIpcArguments(channel, args);
    if (!validation.valid) {
      return Promise.reject(new Error(`Validation: ${validation.error}`));
    }

    // Use sanitized arguments
    const sanitizedArgs = validation.sanitizedArgs ?? args;

    // Start performance monitoring
    const callId = ipcPerformanceMonitor.startCall(channel, sanitizedArgs);

    return ipcRenderer
      .invoke(channel, ...sanitizedArgs)
      .then((result: unknown) => {
        ipcPerformanceMonitor.endCall(callId, true);
        return result;
      })
      .catch((error: Error) => {
        ipcPerformanceMonitor.endCall(callId, false, error.message);
        throw error;
      });
  }) as IpcChannels[T];
};

// Helper function to create secure event listener
const createSecureEventListener = (
  channel: string,
  callback: (...args: unknown[]) => void,
): (() => void) => {
  const wrappedCallback = (...args: unknown[]) => {
    // Security check for event listeners
    const securityCheck = preloadSecurityManager.checkIpcSecurity(channel, args);
    if (!securityCheck.allowed) {
      console.warn(
        `Security: Event listener blocked for channel ${channel}: ${securityCheck.reason}`,
      );
      return;
    }

    // Validate and sanitize incoming data
    const validation = validateIpcArguments(channel as keyof IpcChannels, args);
    const sanitizedArgs = validation.sanitizedArgs ?? args;

    callback(...sanitizedArgs);
  };

  ipcRenderer.on(channel, wrappedCallback);
  return () => ipcRenderer.removeListener(channel, wrappedCallback);
};

// Validate that we're in a secure context
if (!process.contextIsolated) {
  throw new Error('Context isolation must be enabled for security');
}

// Create the secure electron API
const electronAPI = {
  // Window controls
  minimize: createSecureIpcWrapper('window:minimize'),
  maximize: createSecureIpcWrapper('window:maximize'),
  close: createSecureIpcWrapper('window:close'),

  // Application info
  getVersion: createSecureIpcWrapper('app:getVersion'),

  // System info
  getSystemInfo: createSecureIpcWrapper('system:getInfo'),

  // Configuration
  getConfig: createSecureIpcWrapper('config:get'),
  setConfig: createSecureIpcWrapper('config:set'),

  // Event listeners with automatic cleanup
  onWindowFocus: (callback: () => void) => {
    return createSecureEventListener('window:focus', callback);
  },

  onWindowBlur: (callback: () => void) => {
    return createSecureEventListener('window:blur', callback);
  },

  onWindowResize: (callback: (data: { width: number; height: number }) => void) => {
    return createSecureEventListener('window:resize', (data: unknown) => {
      if (data && typeof data === 'object' && 'width' in data && 'height' in data) {
        callback(data as { width: number; height: number });
      }
    });
  },

  onWindowMaximize: (callback: () => void) => {
    return createSecureEventListener('window:maximize', callback);
  },

  onWindowUnmaximize: (callback: () => void) => {
    return createSecureEventListener('window:unmaximize', callback);
  },

  onWindowMinimize: (callback: () => void) => {
    return createSecureEventListener('window:minimize', callback);
  },

  onWindowRestore: (callback: () => void) => {
    return createSecureEventListener('window:restore', callback);
  },

  // Theme system
  getTheme: createSecureIpcWrapper('theme:get'),
  setTheme: createSecureIpcWrapper('theme:set'),
  onThemeChange: (callback: (theme: 'light' | 'dark' | 'system') => void) => {
    return createSecureEventListener('theme:change', (theme: unknown) => {
      if (theme === 'light' || theme === 'dark' || theme === 'system') {
        callback(theme);
      }
    });
  },

  // Development tools
  isDev: createSecureIpcWrapper('dev:isDev'),
  openDevTools: createSecureIpcWrapper('dev:openDevTools'),
  closeDevTools: createSecureIpcWrapper('dev:closeDevTools'),

  // Utility functions
  platform: createSecureIpcWrapper('system:platform'),
  arch: createSecureIpcWrapper('system:arch'),
  version: createSecureIpcWrapper('system:version'),

  // Database operations - Agents
  dbAgentsList: createSecureIpcWrapper('db:agents:list'),
  dbAgentsGet: createSecureIpcWrapper('db:agents:get'),
  dbAgentsCreate: createSecureIpcWrapper('db:agents:create'),
  dbAgentsUpdate: createSecureIpcWrapper('db:agents:update'),
  dbAgentsDelete: createSecureIpcWrapper('db:agents:delete'),

  // Database operations - Conversations
  dbConversationsList: createSecureIpcWrapper('db:conversations:list'),
  dbConversationsGet: createSecureIpcWrapper('db:conversations:get'),
  dbConversationsCreate: createSecureIpcWrapper('db:conversations:create'),
  dbConversationsUpdate: createSecureIpcWrapper('db:conversations:update'),
  dbConversationsDelete: createSecureIpcWrapper('db:conversations:delete'),

  // Database operations - Messages
  dbMessagesList: createSecureIpcWrapper('db:messages:list'),
  dbMessagesGet: createSecureIpcWrapper('db:messages:get'),
  dbMessagesCreate: createSecureIpcWrapper('db:messages:create'),
  dbMessagesDelete: createSecureIpcWrapper('db:messages:delete'),

  // Database operations - Conversation-Agent relationships
  dbConversationAgentsList: createSecureIpcWrapper('db:conversation-agents:list'),
  dbConversationAgentsAdd: createSecureIpcWrapper('db:conversation-agents:add'),
  dbConversationAgentsRemove: createSecureIpcWrapper('db:conversation-agents:remove'),

  // Database operations - Backup and recovery
  dbBackupCreate: createSecureIpcWrapper('db:backup:create'),
  dbBackupRestore: createSecureIpcWrapper('db:backup:restore'),
  dbBackupList: createSecureIpcWrapper('db:backup:list'),
  dbBackupDelete: createSecureIpcWrapper('db:backup:delete'),
  dbBackupValidate: createSecureIpcWrapper('db:backup:validate'),
  dbBackupCleanup: createSecureIpcWrapper('db:backup:cleanup'),
  dbBackupStats: createSecureIpcWrapper('db:backup:stats'),

  // Secure storage operations - Credentials
  secureCredentialsGet: createSecureIpcWrapper('secure:credentials:get'),
  secureCredentialsSet: createSecureIpcWrapper('secure:credentials:set'),
  secureCredentialsDelete: createSecureIpcWrapper('secure:credentials:delete'),
  secureCredentialsList: createSecureIpcWrapper('secure:credentials:list'),

  // Secure storage operations - Direct keytar access
  secureKeytarGet: createSecureIpcWrapper('secure:keytar:get'),
  secureKeytarSet: createSecureIpcWrapper('secure:keytar:set'),
  secureKeytarDelete: createSecureIpcWrapper('secure:keytar:delete'),

  // Performance monitoring operations
  performanceGetUnifiedReport: createSecureIpcWrapper('performance:getUnifiedReport'),
  performanceGetDatabaseMetrics: createSecureIpcWrapper('performance:getDatabaseMetrics'),
  performanceGetIpcMetrics: createSecureIpcWrapper('performance:getIpcMetrics'),
  performanceGetSystemMetrics: createSecureIpcWrapper('performance:getSystemMetrics'),
  performanceGetRecentMetrics: createSecureIpcWrapper('performance:getRecentMetrics'),
  performanceGetHistory: createSecureIpcWrapper('performance:getHistory'),
  performanceGetAlerts: createSecureIpcWrapper('performance:getAlerts'),
  performanceResolveAlert: createSecureIpcWrapper('performance:resolveAlert'),
  performanceOptimize: createSecureIpcWrapper('performance:optimize'),
  performanceSetThresholds: createSecureIpcWrapper('performance:setThresholds'),
  performanceGetThresholds: createSecureIpcWrapper('performance:getThresholds'),
  performanceEnableMonitoring: createSecureIpcWrapper('performance:enableMonitoring'),
  performanceDisableMonitoring: createSecureIpcWrapper('performance:disableMonitoring'),
  performanceResetMetrics: createSecureIpcWrapper('performance:resetMetrics'),

  // Legacy performance monitoring utilities (for backwards compatibility)
  getPerformanceStats: () => ipcPerformanceMonitor.getAllStats(),
  clearPerformanceStats: () => ipcPerformanceMonitor.clearStats(),
  getRecentMetrics: (limit?: number) => ipcPerformanceMonitor.getRecentMetrics(limit),

  // Security utilities
  getSecurityStats: () => preloadSecurityManager.getSecurityStats(),
  getSecurityAuditLog: () => preloadSecurityManager.getAuditLog(),
  clearSecurityAuditLog: () => preloadSecurityManager.clearAuditLog(),
} as const;

// Type assertion to ensure type safety
const typedElectronAPI: typeof electronAPI = electronAPI;

// Expose the secure API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', typedElectronAPI);

// Security: Prevent direct access to Node.js APIs in renderer
delete (global as unknown as { Buffer?: unknown }).Buffer;
delete (global as unknown as { process?: unknown }).process;
delete (global as unknown as { require?: unknown }).require;

// Clean up listeners on window unload
const cleanupListeners = () => {
  // Clean up existing event listeners
  ipcRenderer.removeAllListeners('window:focus');
  ipcRenderer.removeAllListeners('window:blur');
  ipcRenderer.removeAllListeners('window:resize');
  ipcRenderer.removeAllListeners('window:maximize');
  ipcRenderer.removeAllListeners('window:unmaximize');
  ipcRenderer.removeAllListeners('window:minimize');
  ipcRenderer.removeAllListeners('window:restore');
  ipcRenderer.removeAllListeners('theme:change');

  // Clean up performance monitoring
  ipcPerformanceMonitor.clearStats();

  // Clean up security audit log
  preloadSecurityManager.clearAuditLog();
};

// Handle cleanup on beforeunload
globalThis.addEventListener('beforeunload', cleanupListeners);

// Handle cleanup on exit (only if process.on is available)
if (typeof process?.on === 'function') {
  process.on('exit', cleanupListeners);
}

// Export type for use in renderer
export type ElectronAPI = typeof electronAPI;
