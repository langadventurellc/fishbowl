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
  'db:messages:update-active-state': (
    id: string,
    updates: UpdateMessageActiveStateData,
  ) => Promise<Message | null>;
  'db:messages:delete': (id: string) => Promise<void>;
  'db:conversation-agents:list': (conversationId: string) => Promise<ConversationAgent[]>;
  'db:conversation-agents:add': (conversationId: string, agentId: string) => Promise<void>;
  'db:conversation-agents:remove': (conversationId: string, agentId: string) => Promise<void>;

  // Database backup operations
  'db:backup:create': (options?: BackupOptions) => Promise<BackupResult>;
  'db:backup:restore': (backupPath: string, options?: RestoreOptions) => Promise<RestoreResult>;
  'db:backup:list': () => Promise<BackupMetadata[]>;
  'db:backup:delete': (backupId: string) => Promise<boolean>;
  'db:backup:validate': (backupPath: string) => Promise<boolean>;
  'db:backup:cleanup': () => Promise<string[]>;
  'db:backup:stats': () => Promise<BackupStats>;

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

  // Performance monitoring operations
  'performance:getUnifiedReport': () => Promise<UnifiedPerformanceReport>;
  'performance:getDatabaseMetrics': () => Promise<DatabasePerformanceMetrics>;
  'performance:getIpcMetrics': () => Promise<IpcPerformanceMetrics>;
  'performance:getSystemMetrics': () => Promise<SystemPerformanceMetrics>;
  'performance:getRecentMetrics': (count?: number) => Promise<PerformanceMetric[]>;
  'performance:getHistory': (duration?: number) => Promise<PerformanceHistoryPoint[]>;
  'performance:getAlerts': (unresolved?: boolean) => Promise<PerformanceAlert[]>;
  'performance:resolveAlert': (alertId: string) => Promise<void>;
  'performance:optimize': (
    request?: PerformanceOptimizationRequest,
  ) => Promise<PerformanceOptimizationResult>;
  'performance:setThresholds': (thresholds: Partial<PerformanceThresholds>) => Promise<void>;
  'performance:getThresholds': () => Promise<PerformanceThresholds>;
  'performance:enableMonitoring': (
    category?: 'database' | 'ipc' | 'system' | 'all',
  ) => Promise<void>;
  'performance:disableMonitoring': (
    category?: 'database' | 'ipc' | 'system' | 'all',
  ) => Promise<void>;
  'performance:resetMetrics': (category?: 'database' | 'ipc' | 'system' | 'all') => Promise<void>;
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
  isActive: boolean;
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
  isActive?: boolean;
  metadata?: string;
}

export interface UpdateMessageActiveStateData {
  isActive: boolean;
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

// Database backup types
export interface BackupOptions {
  directory?: string;
  compression?: boolean;
  includeWal?: boolean;
  includeShm?: boolean;
  maxBackups?: number;
  autoCleanup?: boolean;
  customFileName?: string;
}

export interface RestoreOptions {
  backupPath?: string;
  createBackupBeforeRestore?: boolean;
  validateIntegrity?: boolean;
  overwriteExisting?: boolean;
  restoreWal?: boolean;
  restoreShm?: boolean;
}

export interface BackupResult {
  success: boolean;
  filePath?: string;
  size?: number;
  timestamp?: number;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  restoredFile?: string;
  backupCreated?: string;
  dbVersion?: number;
  timestamp?: number;
  error?: string;
}

export interface BackupMetadata {
  id: string;
  timestamp: number;
  filePath: string;
  size: number;
  compressed: boolean;
  dbVersion: number;
  appVersion: string;
  checksum: string;
  walIncluded: boolean;
  shmIncluded: boolean;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  oldestBackup?: number;
  newestBackup?: number;
}

// Performance monitoring types
export interface PerformanceMetric {
  id: string;
  type: 'database' | 'ipc' | 'system';
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface DatabasePerformanceMetrics {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
  failedQueries: number;
  queryDistribution: Record<string, number>;
  cacheHitRate: number;
  walSize: number;
  lastCheckpoint: number;
  databaseSize: number;
  connectionCount: number;
}

export interface IpcPerformanceMetrics {
  totalCalls: number;
  averageCallDuration: number;
  slowCalls: number;
  failedCalls: number;
  channelDistribution: Record<string, number>;
  memoryUsage: number;
  activeHandlers: number;
}

export interface SystemPerformanceMetrics {
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
}

export interface UnifiedPerformanceReport {
  timestamp: number;
  duration: number;
  database: DatabasePerformanceMetrics;
  ipc: IpcPerformanceMetrics;
  system: SystemPerformanceMetrics;
  alerts: PerformanceAlert[];
  recommendations: string[];
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  category: 'database' | 'ipc' | 'system';
  message: string;
  timestamp: number;
  threshold?: number;
  actualValue?: number;
  resolved: boolean;
}

export interface PerformanceThresholds {
  database: {
    maxQueryTime: number;
    maxWalSize: number;
    minCacheHitRate: number;
    maxFailureRate: number;
  };
  ipc: {
    maxCallDuration: number;
    maxMemoryUsage: number;
    maxFailureRate: number;
  };
  system: {
    maxCpuUsage: number;
    maxMemoryUsage: number;
    maxDiskUsage: number;
  };
}

export interface PerformanceHistoryPoint {
  timestamp: number;
  database: {
    queryTime: number;
    queryCount: number;
    cacheHitRate: number;
  };
  ipc: {
    callDuration: number;
    callCount: number;
    memoryUsage: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
  };
}

export interface PerformanceOptimizationRequest {
  targetAreas?: ('database' | 'ipc' | 'all')[];
  aggressive?: boolean;
  autoFix?: boolean;
  dryRun?: boolean;
}

export interface PerformanceOptimizationResult {
  success: boolean;
  optimizationsApplied: string[];
  performanceGain?: number;
  warnings?: string[];
  error?: string;
}
