/**
 * Database performance monitoring IPC handlers
 */

export { getUnifiedReportHandler } from './getUnifiedReportHandler';
export { getDatabaseMetricsHandler } from './getDatabaseMetricsHandler';
export { getIpcMetricsHandler } from './getIpcMetricsHandler';
export { getSystemMetricsHandler } from './getSystemMetricsHandler';
export { getRecentMetricsHandler } from './getRecentMetricsHandler';
export { optimizeHandler } from './optimizeHandler';
export { getHistoryHandler } from './getHistoryHandler';
export { getAlertsHandler } from './getAlertsHandler';
export { resolveAlertHandler } from './resolveAlertHandler';
export { addPerformanceAlert } from './addPerformanceAlert';
export { getPerformanceAlerts } from './getPerformanceAlerts';
export { getThresholdsHandler } from './thresholdsHandler';
export { setThresholdsHandler } from './setThresholdsHandler';
export { getThresholds } from './getThresholds';
export { setThresholds } from './setThresholds';
export { enableMonitoringHandler } from './enableMonitoringHandler';
export { disableMonitoringHandler } from './disableMonitoringHandler';
export { resetMetricsHandler } from './resetMetricsHandler';
export { getMonitoringState } from './getMonitoringState';
export { setMonitoringState } from './setMonitoringState';
export { startHistoryCollection } from './startHistoryCollection';
export { stopHistoryCollection } from './stopHistoryCollection';
export { getPerformanceHistory } from './getPerformanceHistory';

/**
 * Register all database performance handlers
 */
export function registerDatabasePerformanceHandlers(): void {
  // TODO: Implement handler registration once dependencies are fixed
  // This function is currently a placeholder to maintain the API
}
