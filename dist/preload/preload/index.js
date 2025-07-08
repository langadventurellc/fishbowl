'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const electron_1 = require('electron');
// Helper function to create secure IPC wrapper
const createSecureIpcWrapper = channel => {
  return (...args) => {
    return electron_1.ipcRenderer.invoke(channel, ...args);
  };
};
// Helper function to create secure event listener
const createSecureEventListener = (channel, callback) => {
  const wrappedCallback = (...args) => {
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
  electron_1.ipcRenderer.on(channel, wrappedCallback);
  return () => electron_1.ipcRenderer.removeListener(channel, wrappedCallback);
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
  onWindowFocus: callback => {
    return createSecureEventListener('window:focus', callback);
  },
  onWindowBlur: callback => {
    return createSecureEventListener('window:blur', callback);
  },
  onWindowResize: callback => {
    return createSecureEventListener('window:resize', data => {
      if (data && typeof data === 'object' && 'width' in data && 'height' in data) {
        callback(data);
      }
    });
  },
  onWindowMaximize: callback => {
    return createSecureEventListener('window:maximize', callback);
  },
  onWindowUnmaximize: callback => {
    return createSecureEventListener('window:unmaximize', callback);
  },
  onWindowMinimize: callback => {
    return createSecureEventListener('window:minimize', callback);
  },
  onWindowRestore: callback => {
    return createSecureEventListener('window:restore', callback);
  },
  // Theme system
  getTheme: createSecureIpcWrapper('theme:get'),
  setTheme: createSecureIpcWrapper('theme:set'),
  onThemeChange: callback => {
    return createSecureEventListener('theme:change', theme => {
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
};
// Type assertion to ensure type safety
const typedElectronAPI = electronAPI;
// Expose the secure API to the renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', typedElectronAPI);
// Security: Prevent direct access to Node.js APIs in renderer
delete global.Buffer;
delete global.process;
delete global.require;
// Clean up listeners on window unload
const cleanupListeners = () => {
  electron_1.ipcRenderer.removeAllListeners('window:focus');
  electron_1.ipcRenderer.removeAllListeners('window:blur');
  electron_1.ipcRenderer.removeAllListeners('window:resize');
  electron_1.ipcRenderer.removeAllListeners('window:maximize');
  electron_1.ipcRenderer.removeAllListeners('window:unmaximize');
  electron_1.ipcRenderer.removeAllListeners('window:minimize');
  electron_1.ipcRenderer.removeAllListeners('window:restore');
  electron_1.ipcRenderer.removeAllListeners('theme:change');
};
// Handle cleanup on beforeunload
globalThis.addEventListener('beforeunload', cleanupListeners);
// Handle cleanup on exit
process.on('exit', cleanupListeners);
