// Theme system - migrated to Zustand store
export { useTheme } from './useTheme.hook';

// IPC hooks
export * from './useIpc.index';

// Database hooks
export { useAgents } from './useAgents';
export { useBackup } from './useBackup/useBackup';
export type { UseBackupState, UseBackupActions, UseBackupReturn } from './useBackup';
export { useConversationAgents } from './useConversationAgents';
export { useConversations } from './useConversations';
export { useDatabase } from './useDatabase';
export { useMessages } from './useMessages';

// Database context and provider - removed (migrated to Zustand store)

// Secure storage hooks
export { useKeytar } from './useKeytar';
export { useSecureStorage } from './useSecureStorage';

// Performance monitoring hooks
export { usePerformanceMonitor } from './usePerformanceMonitor';
export type { UsePerformanceMonitorReturn } from './UsePerformanceMonitorReturn';
