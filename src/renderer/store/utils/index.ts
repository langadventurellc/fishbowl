/**
 * Barrel exports for store utilities
 */

export * from './SystemThemeDetector';
export * from './systemThemeDetectorInstance';
export * from './getCurrentSystemTheme';
export * from './isSystemThemeSupported';
export * from './createIPCStoreBridge';
export * from './createOptimisticUpdate';
export * from './validateStoreUpdate';
export * from './memoization';

// Performance monitoring exports (avoid conflicts with memoization)
export {
  StoreOperationPerformanceMonitor,
  performance,
  getPerformanceMonitor as getStorePerformanceMonitor,
  enablePerformanceMonitoring as enableStorePerformanceMonitoring,
  disablePerformanceMonitoring,
  getPerformanceMetrics,
  getPerformanceReport,
  resetPerformanceMetrics,
  subscribeToPerformanceMetrics,
  monitorCustomOperation,
  monitorCustomSyncOperation,
} from './performance';
export type {
  PerformanceThresholds,
  OperationMetadata,
  OperationRecord,
  OperationMetrics,
  OperationPerformanceData,
  GlobalOperationMetrics,
} from './performance';
