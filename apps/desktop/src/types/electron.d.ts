import type { ConversationsAPI } from "./ConversationsAPI";

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
   * Registers a callback to be invoked when a new conversation should be created.
   * This is triggered by Electron menu items or keyboard shortcuts (Cmd/Ctrl+N).
   *
   * @param callback - Function to execute when a new conversation should be created
   * @returns Cleanup function to remove the event listener and prevent memory leaks
   */
  onNewConversation: (callback: () => void) => () => void;
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
  /**
   * Conversations operations for managing conversation data.
   * Provides CRUD operations for conversations through IPC handlers.
   */
  conversations: ConversationsAPI;
  /**
   * Personality definitions operations for loading personality metadata.
   * Provides access to personality trait definitions and values from JSON resources.
   */
  personalityDefinitions: {
    /**
     * Load personality definitions from persistent storage.
     * @returns Promise resolving to personality definitions data
     */
    getDefinitions(): Promise<
      import("@fishbowl-ai/shared").PersonalityDefinitions
    >;
  };
  /**
   * Conversation agents operations for managing agent-conversation associations.
   * Provides operations for adding, removing, and querying agents within conversations.
   */
  conversationAgent: {
    /**
     * Get all agents associated with a specific conversation.
     * @param conversationId - ID of the conversation
     * @returns Promise resolving to array of conversation agents
     */
    getByConversation(
      conversationId: string,
    ): Promise<import("@fishbowl-ai/shared").ConversationAgent[]>;
    /**
     * Add an agent to a conversation.
     * @param input - Input data for adding agent to conversation
     * @returns Promise resolving to the created conversation agent
     */
    add(
      input: import("@fishbowl-ai/shared").AddAgentToConversationInput,
    ): Promise<import("@fishbowl-ai/shared").ConversationAgent>;
    /**
     * Remove an agent from a conversation.
     * @param input - Input data for removing agent from conversation
     * @returns Promise resolving to boolean indicating success
     */
    remove(
      input: import("@fishbowl-ai/shared").RemoveAgentFromConversationInput,
    ): Promise<boolean>;
    /**
     * Update a conversation agent's properties.
     * @param request - Request data containing conversation agent ID and updates
     * @returns Promise resolving to the updated conversation agent
     */
    update(
      request: import("../shared/ipc/index").ConversationAgentUpdateRequest,
    ): Promise<import("@fishbowl-ai/shared").ConversationAgent>;
    /**
     * List all conversation agents (for debugging).
     * @returns Promise resolving to array of all conversation agents
     */
    list(): Promise<import("@fishbowl-ai/shared").ConversationAgent[]>;
  };
  /**
   * Messages operations for managing conversation messages.
   * Provides CRUD operations for messages through IPC handlers.
   */
  messages: {
    /**
     * List all messages for a specific conversation.
     * @param conversationId - ID of the conversation
     * @returns Promise resolving to array of messages
     */
    list(
      conversationId: string,
    ): Promise<import("@fishbowl-ai/shared").Message[]>;
    /**
     * Create a new message in a conversation.
     * @param input - Input data for creating the message
     * @returns Promise resolving to the created message
     */
    create(
      input: import("@fishbowl-ai/shared").CreateMessageInput,
    ): Promise<import("@fishbowl-ai/shared").Message>;
    /**
     * Update a message's inclusion flag for context control.
     * @param id - Message ID
     * @param included - Whether the message should be included
     * @returns Promise resolving to the updated message
     */
    updateInclusion(
      id: string,
      included: boolean,
    ): Promise<import("@fishbowl-ai/shared").Message>;
    /**
     * Delete a message from the conversation.
     * @param id - Message ID to delete
     * @returns Promise resolving to boolean indicating success
     */
    delete(id: string): Promise<boolean>;
  };
  /**
   * Chat operations for multi-agent conversation processing.
   * Provides secure interface for triggering agent responses and receiving real-time updates.
   */
  chat: {
    /**
     * Trigger multi-agent responses for a user message in a conversation.
     * Initiates parallel processing by all agents in the conversation.
     * @param conversationId - Unique identifier for the conversation
     * @param userMessageId - Unique identifier for the user message triggering responses
     * @returns Promise resolving when agent processing is initiated (fire-and-forget)
     */
    sendToAgents(conversationId: string, userMessageId: string): Promise<void>;
    /**
     * Register a callback to receive real-time agent status updates.
     * Updates are emitted as agents transition between thinking, complete, and error states.
     * @param callback - Function to execute when agent status changes
     * @returns Cleanup function to remove the event listener and prevent memory leaks
     */
    onAgentUpdate(
      callback: (event: import("../shared/ipc/chat").AgentUpdateEvent) => void,
    ): () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
