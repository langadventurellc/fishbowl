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
   * @returns Cleanup function to remove the event listener and prevent memory leaks
   */
  onOpenSettings: (callback: () => void) => () => void;
  /**
   * Removes all IPC event listeners for the specified channel.
   * Used for cleanup when components unmount to prevent memory leaks.
   *
   * @param channel - The IPC channel name to clean up listeners for
   */
  removeAllListeners: (channel: string) => void;
  /**
   * Settings persistence operations for communicating with main process.
   * Provides async methods for loading, saving, and resetting application settings.
   */
  settings: {
    /**
     * Load settings from persistent storage.
     * @returns Promise resolving to settings data
     */
    load: () => Promise<import("@fishbowl-ai/shared").PersistedSettingsData>;
    /**
     * Save settings to persistent storage.
     * @param settings - Settings data to persist
     * @param section - Optional settings section identifier
     * @returns Promise resolving when save is complete
     */
    save: (
      settings: Partial<import("@fishbowl-ai/shared").PersistedSettingsData>,
      section?: import("@fishbowl-ai/ui-shared").SettingsCategory,
    ) => Promise<void>;
    /**
     * Reset settings to default values.
     * @returns Promise resolving to reset settings data
     */
    reset: () => Promise<import("@fishbowl-ai/shared").PersistedSettingsData>;
    /**
     * Apply debug logging setting immediately without requiring restart.
     * @param enabled - Whether debug logging should be enabled
     * @returns Promise resolving when debug logging has been applied
     */
    setDebugLogging: (enabled: boolean) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
