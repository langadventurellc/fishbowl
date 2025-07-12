/* eslint-disable no-console */
import type { IpcPerformanceConfig } from './IpcPerformanceConfig';
import { IpcPerformanceMonitor } from './IpcPerformanceMonitor';
import { IpcPerformanceOptimizer } from './IpcPerformanceOptimizer';
import type { IpcPerformanceReport } from './IpcPerformanceReport';

class IpcPerformanceManager {
  private monitor: IpcPerformanceMonitor;
  private optimizer: IpcPerformanceOptimizer;
  private autoOptimizationEnabled: boolean = false;

  constructor() {
    const config: IpcPerformanceConfig = {
      slowCallThreshold: 100,
      memoryTrackingEnabled: true,
      reportingInterval: 300000, // 5 minutes
      autoReporting: true,
      onSlowCall: (channel, duration) => {
        console.warn(`Slow IPC call detected: ${channel} took ${duration}ms`);
      },
      onPerformanceReport: report => {
        void this.handlePerformanceReport(report);
      },
    };

    this.monitor = new IpcPerformanceMonitor(config);
    this.optimizer = new IpcPerformanceOptimizer({
      onOptimization: result => {
        console.info(
          `Performance optimization applied: ${result.ruleName} for ${result.channel}`,
          result,
        );
      },
    });
  }

  trackCall<T>(channel: string, operation: () => Promise<T>): Promise<T> {
    return this.monitor.trackCall(channel, operation);
  }

  enableAutoOptimization(): void {
    this.autoOptimizationEnabled = true;
  }

  disableAutoOptimization(): void {
    this.autoOptimizationEnabled = false;
  }

  generateReport(): IpcPerformanceReport {
    return this.monitor.generateReport();
  }

  async optimizePerformance(): Promise<void> {
    const report = this.generateReport();
    await this.optimizer.optimizeFromReport(report);
  }

  getMetrics(channel?: string) {
    return this.monitor.getMetrics(channel);
  }

  getSlowCalls() {
    return this.monitor.getSlowCalls();
  }

  resetMetrics(channel?: string): void {
    this.monitor.resetMetrics(channel);
  }

  private async handlePerformanceReport(report: IpcPerformanceReport): Promise<void> {
    // Log performance summary
    console.info('IPC Performance Report', {
      totalCalls: report.totalCalls,
      averageTime: report.averageTime.toFixed(2),
      slowCallPercentage: report.slowCallPercentage.toFixed(2),
      memoryDelta: report.totalMemoryDelta,
      recommendations: report.recommendations,
    });

    // Auto-optimize if enabled
    if (this.autoOptimizationEnabled) {
      await this.optimizer.optimizeFromReport(report);
    }
  }

  // Cache management methods
  getCachedValue(channel: string, key: string): unknown {
    return this.optimizer.getCachedValue(channel, key);
  }

  setCachedValue(channel: string, key: string, value: unknown): void {
    this.optimizer.setCachedValue(channel, key, value);
  }

  clearCache(channel?: string): void {
    this.optimizer.clearCache(channel);
  }

  // Utility methods
  setSlowCallThreshold(threshold: number): void {
    this.monitor.setSlowCallThreshold(threshold);
  }

  enableMemoryTracking(enabled: boolean): void {
    this.monitor.enableMemoryTracking(enabled);
  }

  startReporting(): void {
    this.monitor.startReporting();
  }

  stopReporting(): void {
    this.monitor.stopReporting();
  }

  getOptimizationStats() {
    return this.optimizer.getOptimizationStats();
  }
}

// Create singleton instance
export const ipcPerformanceManager = new IpcPerformanceManager();
