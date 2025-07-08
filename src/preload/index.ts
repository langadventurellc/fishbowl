import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  
  // Application info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  
  // Future IPC methods will be added here
  
  // Event listeners
  onWindowFocus: (callback: () => void) => {
    ipcRenderer.on('window:focus', callback)
    return () => ipcRenderer.removeListener('window:focus', callback)
  },
  
  onWindowBlur: (callback: () => void) => {
    ipcRenderer.on('window:blur', callback)
    return () => ipcRenderer.removeListener('window:blur', callback)
  }
})

// Remove all listeners on window unload
window.addEventListener('beforeunload', () => {
  ipcRenderer.removeAllListeners('window:focus')
  ipcRenderer.removeAllListeners('window:blur')
})