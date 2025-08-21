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
  /**
   * LLM configuration operations for managing AI provider settings.
   * Provides CRUD operations for LLM configurations with secure API key storage.
   */
  llmConfig: {
    /**
     * Create a new LLM configuration.
     * @param config - Configuration input with provider details and API key
     * @returns Promise resolving to created configuration
     */
    create: (
      config: import("@fishbowl-ai/shared").LlmConfigInput,
    ) => Promise<import("@fishbowl-ai/shared").LlmConfig>;
    /**
     * Read a specific LLM configuration.
     * @param id - Configuration ID
     * @returns Promise resolving to configuration or null if not found
     */
    read: (
      id: string,
    ) => Promise<import("@fishbowl-ai/shared").LlmConfig | null>;
    /**
     * Update an existing LLM configuration.
     * @param id - Configuration ID
     * @param updates - Partial configuration updates
     * @returns Promise resolving to updated configuration
     */
    update: (
      id: string,
      updates: Partial<import("@fishbowl-ai/shared").LlmConfigInput>,
    ) => Promise<import("@fishbowl-ai/shared").LlmConfig>;
    /**
     * Delete an LLM configuration.
     * @param id - Configuration ID
     * @returns Promise resolving when deletion is complete
     */
    delete: (id: string) => Promise<void>;
    /**
     * List all LLM configurations (metadata only, no API keys).
     * @returns Promise resolving to array of configuration metadata
     */
    list: () => Promise<import("@fishbowl-ai/shared").LlmConfigMetadata[]>;
    /**
     * Refresh the LLM configuration cache by reloading from storage.
     * @returns Promise resolving when cache refresh is complete
     */
    refreshCache: () => Promise<void>;
  };
  /**
   * Roles persistence operations for managing role configurations.
   * Provides async methods for loading, saving, and resetting roles data.
   */
  roles: {
    /**
     * Load roles from persistent storage.
     * @returns Promise resolving to roles data
     */
    load(): Promise<import("@fishbowl-ai/shared").PersistedRolesSettingsData>;
    /**
     * Save roles to persistent storage.
     * @param roles - Roles data to persist
     * @returns Promise resolving when save is complete
     */
    save(
      roles: import("@fishbowl-ai/shared").PersistedRolesSettingsData,
    ): Promise<void>;
    /**
     * Reset roles to default values.
     * @returns Promise resolving to reset roles data
     */
    reset(): Promise<import("@fishbowl-ai/shared").PersistedRolesSettingsData>;
  };
  /**
   * Personalities persistence operations for managing personality configurations.
   * Provides async methods for loading, saving, and resetting personalities data.
   */
  personalities: {
    /**
     * Load personalities from persistent storage.
     * @returns Promise resolving to personalities data
     */
    load(): Promise<
      import("@fishbowl-ai/shared").PersistedPersonalitiesSettingsData
    >;
    /**
     * Save personalities to persistent storage.
     * @param personalities - Personalities data to persist
     * @returns Promise resolving when save is complete
     */
    save(
      personalities: import("@fishbowl-ai/shared").PersistedPersonalitiesSettingsData,
    ): Promise<void>;
    /**
     * Reset personalities to default values.
     * @returns Promise resolving to reset personalities data
     */
    reset(): Promise<
      import("@fishbowl-ai/shared").PersistedPersonalitiesSettingsData
    >;
  };
  /**
   * LLM models persistence operations for managing model configurations.
   * Provides async methods for loading LLM model definitions.
   */
  llmModels: {
    /**
     * Load LLM models from persistent storage.
     * @returns Promise resolving to LLM models data
     */
    load(): Promise<
      import("@fishbowl-ai/shared").PersistedLlmModelsSettingsData
    >;
  };
  /**
   * Agents persistence operations for managing agent configurations.
   * Provides async methods for loading, saving, and resetting agents data.
   */
  agents: {
    /**
     * Load agents from persistent storage.
     * @returns Promise resolving to agents data
     */
    load(): Promise<import("@fishbowl-ai/shared").PersistedAgentsSettingsData>;
    /**
     * Save agents to persistent storage.
     * @param agents - Agents data to persist
     * @returns Promise resolving when save is complete
     */
    save(
      agents: import("@fishbowl-ai/shared").PersistedAgentsSettingsData,
    ): Promise<void>;
    /**
     * Reset agents to default values.
     * @returns Promise resolving to reset agents data
     */
    reset(): Promise<import("@fishbowl-ai/shared").PersistedAgentsSettingsData>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
