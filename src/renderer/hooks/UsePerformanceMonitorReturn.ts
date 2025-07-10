import type {
  UnifiedPerformanceReport,
  DatabasePerformanceMetrics,
  IpcPerformanceMetrics,
  SystemPerformanceMetrics,
  PerformanceMetric,
  PerformanceHistoryPoint,
  PerformanceAlert,
  PerformanceThresholds,
  PerformanceOptimizationRequest,
  PerformanceOptimizationResult,
} from '@shared/types';

interface UsePerformanceMonitorState {
  unifiedReport: UnifiedPerformanceReport | null;
  databaseMetrics: DatabasePerformanceMetrics | null;
  ipcMetrics: IpcPerformanceMetrics | null;
  systemMetrics: SystemPerformanceMetrics | null;
  recentMetrics: PerformanceMetric[];
  history: PerformanceHistoryPoint[];
  alerts: PerformanceAlert[];
  thresholds: PerformanceThresholds | null;
  isMonitoring: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface UsePerformanceMonitorActions {
  refreshUnifiedReport: () => Promise<void>;
  refreshDatabaseMetrics: () => Promise<void>;
  refreshIpcMetrics: () => Promise<void>;
  refreshSystemMetrics: () => Promise<void>;
  refreshRecentMetrics: (count?: number) => Promise<void>;
  refreshHistory: (duration?: number) => Promise<void>;
  refreshAlerts: (unresolvedOnly?: boolean) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  optimize: (request?: PerformanceOptimizationRequest) => Promise<PerformanceOptimizationResult>;
  setThresholds: (thresholds: Partial<PerformanceThresholds>) => Promise<void>;
  refreshThresholds: () => Promise<void>;
  enableMonitoring: (category?: 'database' | 'ipc' | 'system' | 'all') => Promise<void>;
  disableMonitoring: (category?: 'database' | 'ipc' | 'system' | 'all') => Promise<void>;
  resetMetrics: (category?: 'database' | 'ipc' | 'system' | 'all') => Promise<void>;
  startAutoRefresh: (interval?: number) => void;
  stopAutoRefresh: () => void;
}

export interface UsePerformanceMonitorReturn
  extends UsePerformanceMonitorState,
    UsePerformanceMonitorActions {}
