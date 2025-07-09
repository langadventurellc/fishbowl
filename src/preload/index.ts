import { contextBridge, ipcRenderer } from 'electron';
import type { IpcChannels } from '../shared/types';

// Helper function to create secure IPC wrapper
const createSecureIpcWrapper = <T extends keyof IpcChannels>(channel: T): IpcChannels[T] => {
  return ((...args: Parameters<IpcChannels[T]>) => {
    return ipcRenderer.invoke(channel, ...args);
  }) as IpcChannels[T];
};

// Helper function to create secure event listener
const createSecureEventListener = (
  channel: string,
  callback: (...args: unknown[]) => void,
): (() => void) => {
  const wrappedCallback = (...args: unknown[]) => {
    // Validate incoming data to prevent XSS attacks
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        // Basic sanitization - in production, use a proper sanitization library
        return arg.replace(/<script[^>]*>.*?<\/script>/gi, '');
      }
      return arg;
    });
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
  ipcRenderer.removeAllListeners('window:focus');
  ipcRenderer.removeAllListeners('window:blur');
  ipcRenderer.removeAllListeners('window:resize');
  ipcRenderer.removeAllListeners('window:maximize');
  ipcRenderer.removeAllListeners('window:unmaximize');
  ipcRenderer.removeAllListeners('window:minimize');
  ipcRenderer.removeAllListeners('window:restore');
  ipcRenderer.removeAllListeners('theme:change');
};

// Handle cleanup on beforeunload
globalThis.addEventListener('beforeunload', cleanupListeners);

// Handle cleanup on exit
process.on('exit', cleanupListeners);

// Export type for use in renderer
export type ElectronAPI = typeof electronAPI;
