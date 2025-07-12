// Theme system - migrated to Zustand store
export { useTheme } from './useTheme.hook';

// IPC hooks
export * from './useIpc';

// Database hooks
export { useAgents } from './useAgents';
export { useBackup } from './useBackup/useBackup';
export type { UseBackupState, UseBackupActions, UseBackupReturn } from './useBackup';
export { useConversationAgents } from './useConversationAgents';
export { useConversations } from './useConversations';
export { useDatabase } from './useDatabase';
export { useMessages } from './useMessages';

// Platform detection hooks
export * from './usePlatform';

// Database context and provider - removed (migrated to Zustand store)

// Secure storage hooks
export { useKeytar } from './useKeytar';
export { useSecureStorage } from './useSecureStorage';

// Performance monitoring hooks
export { usePerformanceMonitor } from './usePerformanceMonitor';
export type { UsePerformanceMonitorReturn } from './UsePerformanceMonitorReturn';

// Message error handling types
export { MessageErrorType } from './MessageErrorType';
export type { MessageError } from './MessageError';
