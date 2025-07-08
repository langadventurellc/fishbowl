'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const electron_1 = require('electron');
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
  maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
  close: () => electron_1.ipcRenderer.invoke('window:close'),
  // Application info
  getVersion: () => electron_1.ipcRenderer.invoke('app:getVersion'),
  // Future IPC methods will be added here
  // Event listeners
  onWindowFocus: callback => {
    electron_1.ipcRenderer.on('window:focus', callback);
    return () =>
      electron_1.ipcRenderer.removeListener('window:focus', callback);
  },
  onWindowBlur: callback => {
    electron_1.ipcRenderer.on('window:blur', callback);
    return () => electron_1.ipcRenderer.removeListener('window:blur', callback);
  },
});
// Remove all listeners on window unload
// Note: In preload context, we have access to window object due to DOM types
globalThis.addEventListener('beforeunload', () => {
  electron_1.ipcRenderer.removeAllListeners('window:focus');
  electron_1.ipcRenderer.removeAllListeners('window:blur');
});
