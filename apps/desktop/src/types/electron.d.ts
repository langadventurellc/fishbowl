export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  /**
   * Registers a callback to be invoked when the settings modal should be opened.
   * This is triggered by Electron menu items or keyboard shortcuts (Cmd/Ctrl+,).
   *
   * @param callback - Function to execute when settings should be opened
   */
  onOpenSettings: (callback: () => void) => void;
  /**
   * Removes all IPC event listeners for the specified channel.
   * Used for cleanup when components unmount to prevent memory leaks.
   *
   * @param channel - The IPC channel name to clean up listeners for
   */
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
