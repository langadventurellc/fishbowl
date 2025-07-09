/**
 * Shared type definitions for the Fishbowl application
 */

// System information
export interface SystemInfo {
  platform: NodeJS.Platform;
  arch: string;
  version: string;
  appVersion: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  memory: {
    used: number;
    total: number;
  };
}

// Configuration types
export interface ConfigValue {
  theme: 'light' | 'dark' | 'system';
  windowState: WindowState;
  devTools: boolean;
  autoUpdater: boolean;
  telemetry: boolean;
}

export type ConfigKey = keyof ConfigValue;

// IPC Channel definitions with proper typing
export interface IpcChannels {
  // Window controls
  'window:minimize': () => Promise<void>;
  'window:maximize': () => Promise<void>;
  'window:close': () => Promise<void>;

  // Application
  'app:getVersion': () => Promise<string>;

  // System
  'system:getInfo': () => Promise<SystemInfo>;
  'system:platform': () => Promise<NodeJS.Platform>;
  'system:arch': () => Promise<string>;
  'system:version': () => Promise<string>;

  // Configuration
  'config:get': <K extends ConfigKey>(key: K) => Promise<ConfigValue[K]>;
  'config:set': <K extends ConfigKey>(key: K, value: ConfigValue[K]) => Promise<void>;

  // Theme
  'theme:get': () => Promise<'light' | 'dark' | 'system'>;
  'theme:set': (theme: 'light' | 'dark' | 'system') => Promise<void>;

  // Development
  'dev:isDev': () => Promise<boolean>;
  'dev:openDevTools': () => Promise<void>;
  'dev:closeDevTools': () => Promise<void>;

  // Database operations
  'db:agents:list': (filter?: DatabaseFilter) => Promise<Agent[]>;
  'db:agents:get': (id: string) => Promise<Agent | null>;
  'db:agents:create': (agent: CreateAgentData) => Promise<Agent>;
  'db:agents:update': (id: string, updates: UpdateAgentData) => Promise<Agent>;
  'db:agents:delete': (id: string) => Promise<void>;
  'db:conversations:list': (filter?: DatabaseFilter) => Promise<Conversation[]>;
  'db:conversations:get': (id: string) => Promise<Conversation | null>;
  'db:conversations:create': (conversation: CreateConversationData) => Promise<Conversation>;
  'db:conversations:update': (id: string, updates: UpdateConversationData) => Promise<Conversation>;
  'db:conversations:delete': (id: string) => Promise<void>;
  'db:messages:list': (conversationId: string, filter?: DatabaseFilter) => Promise<Message[]>;
  'db:messages:get': (id: string) => Promise<Message | null>;
  'db:messages:create': (message: CreateMessageData) => Promise<Message>;
  'db:messages:delete': (id: string) => Promise<void>;
  'db:conversation-agents:list': (conversationId: string) => Promise<ConversationAgent[]>;
  'db:conversation-agents:add': (conversationId: string, agentId: string) => Promise<void>;
  'db:conversation-agents:remove': (conversationId: string, agentId: string) => Promise<void>;

  // Secure storage operations
  'secure:credentials:get': (provider: AiProvider) => Promise<CredentialInfo | null>;
  'secure:credentials:set': (
    provider: AiProvider,
    apiKey: string,
    metadata?: Record<string, unknown>,
  ) => Promise<void>;
  'secure:credentials:delete': (provider: AiProvider) => Promise<void>;
  'secure:credentials:list': () => Promise<CredentialInfo[]>;
  'secure:keytar:get': (service: string, account: string) => Promise<string | null>;
  'secure:keytar:set': (service: string, account: string, password: string) => Promise<void>;
  'secure:keytar:delete': (service: string, account: string) => Promise<void>;
}

// Window state
export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
}

// Application configuration
export interface AppConfig {
  window: WindowState;
  theme: 'light' | 'dark' | 'system';
  autoUpdater: {
    enabled: boolean;
    checkInterval: number;
  };
}

// Agent types - matches database schema
export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Message types - matches database schema
export interface Message {
  id: string;
  conversationId: string;
  agentId: string;
  content: string;
  type: string;
  metadata: string;
  timestamp: number;
}

// Conversation types - matches database schema
export interface Conversation {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

// Conversation-Agent relationship type
export interface ConversationAgent {
  conversationId: string;
  agentId: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
}

// Event types
export type AppEvent =
  | { type: 'WINDOW_FOCUS' }
  | { type: 'WINDOW_BLUR' }
  | { type: 'WINDOW_RESIZE'; payload: { width: number; height: number } }
  | { type: 'AGENT_CREATED'; payload: Agent }
  | { type: 'AGENT_UPDATED'; payload: Agent }
  | { type: 'AGENT_DELETED'; payload: { id: string } }
  | { type: 'CONVERSATION_CREATED'; payload: Conversation }
  | { type: 'CONVERSATION_UPDATED'; payload: Conversation }
  | { type: 'CONVERSATION_DELETED'; payload: { id: string } }
  | { type: 'MESSAGE_SENT'; payload: Message }
  | { type: 'MESSAGE_RECEIVED'; payload: Message }
  | { type: 'ERROR_OCCURRED'; payload: AppError };

// Database operation types
export interface DatabaseFilter {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  where?: Record<string, unknown>;
}

// Pagination types
export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export interface PaginationRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
  enableTotalCount?: boolean;
}

export interface CreateAgentData {
  name: string;
  role: string;
  personality: string;
  isActive?: boolean;
}

export interface UpdateAgentData {
  name?: string;
  role?: string;
  personality?: string;
  isActive?: boolean;
}

export interface CreateConversationData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateConversationData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateMessageData {
  conversationId: string;
  agentId: string;
  content: string;
  type: string;
  metadata?: string;
}

// Secure storage types
export type AiProvider = 'openai' | 'anthropic' | 'google' | 'groq' | 'ollama';

export interface CredentialInfo {
  provider: AiProvider;
  hasApiKey: boolean;
  lastUpdated: number;
  metadata?: Record<string, unknown>;
}

export interface SecureStorageCredential {
  provider: AiProvider;
  apiKey: string;
  metadata?: Record<string, unknown>;
}
