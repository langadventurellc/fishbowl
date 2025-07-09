import type { IpcPerformanceMetrics } from './IpcPerformanceMetrics';
import type { IpcPerformanceReport } from './IpcPerformanceReport';
import type { IpcPerformanceConfig } from './IpcPerformanceConfig';

export class IpcPerformanceMonitor {
  private metrics: Map<string, IpcPerformanceMetrics> = new Map();
  private slowCallThreshold: number;
  private memoryTrackingEnabled: boolean;
  private reportingInterval: number;
  private reportingTimer?: NodeJS.Timeout;
  private onSlowCall?: (channel: string, duration: number) => void;
  private onPerformanceReport?: (report: IpcPerformanceReport) => void;

  constructor(config: IpcPerformanceConfig = {}) {
    this.slowCallThreshold = config.slowCallThreshold ?? 100;
    this.memoryTrackingEnabled = config.memoryTrackingEnabled ?? true;
    this.reportingInterval = config.reportingInterval ?? 60000; // 1 minute
    this.onSlowCall = config.onSlowCall;
    this.onPerformanceReport = config.onPerformanceReport;

    if (config.autoReporting !== false) {
      this.startReporting();
    }
  }

  trackCall<T>(channel: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return operation()
      .then(result => {
        this.recordCall(channel, startTime, startMemory, true);
        return result;
      })
      .catch(error => {
        this.recordCall(channel, startTime, startMemory, false);
        throw error;
      });
  }

  private recordCall(
    channel: string,
    startTime: number,
    startMemory: NodeJS.MemoryUsage | null,
    success: boolean,
  ): void {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const endMemory = this.getMemoryUsage();

    let metrics = this.metrics.get(channel);
    if (!metrics) {
      metrics = {
        channel,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalTime: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        slowCalls: 0,
        lastCallTime: 0,
        memoryDelta: 0,
        totalMemoryDelta: 0,
      };
      this.metrics.set(channel, metrics);
    }

    metrics.totalCalls++;
    metrics.totalTime += duration;
    metrics.lastCallTime = duration;

    if (success) {
      metrics.successfulCalls++;
    } else {
      metrics.failedCalls++;
    }

    if (duration < metrics.minTime) {
      metrics.minTime = duration;
    }

    if (duration > metrics.maxTime) {
      metrics.maxTime = duration;
    }

    metrics.averageTime = metrics.totalTime / metrics.totalCalls;

    if (duration > this.slowCallThreshold) {
      metrics.slowCalls++;
      this.onSlowCall?.(channel, duration);
    }

    // Track memory usage
    if (startMemory && endMemory && this.memoryTrackingEnabled) {
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
      metrics.memoryDelta = memoryDelta;
      metrics.totalMemoryDelta += memoryDelta;
    }
  }

  getMetrics(channel?: string): IpcPerformanceMetrics | Map<string, IpcPerformanceMetrics> {
    if (channel) {
      return this.metrics.get(channel) ?? this.createEmptyMetrics(channel);
    }
    return new Map(this.metrics);
  }

  getSlowCalls(): Array<{ channel: string; slowCallCount: number; averageTime: number }> {
    return Array.from(this.metrics.entries())
      .filter(([, metrics]) => metrics.slowCalls > 0)
      .map(([channel, metrics]) => ({
        channel,
        slowCallCount: metrics.slowCalls,
        averageTime: metrics.averageTime,
      }))
      .sort((a, b) => b.slowCallCount - a.slowCallCount);
  }

  generateReport(): IpcPerformanceReport {
    const allMetrics = Array.from(this.metrics.values());
    const totalCalls = allMetrics.reduce((sum, m) => sum + m.totalCalls, 0);
    const totalTime = allMetrics.reduce((sum, m) => sum + m.totalTime, 0);
    const totalSlowCalls = allMetrics.reduce((sum, m) => sum + m.slowCalls, 0);
    const totalMemoryDelta = allMetrics.reduce((sum, m) => sum + m.totalMemoryDelta, 0);

    const mostUsedChannels = allMetrics
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 5)
      .map(m => ({ channel: m.channel, calls: m.totalCalls }));

    const slowestChannels = allMetrics
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5)
      .map(m => ({ channel: m.channel, averageTime: m.averageTime }));

    const report: IpcPerformanceReport = {
      timestamp: new Date().toISOString(),
      totalCalls,
      totalTime,
      averageTime: totalCalls > 0 ? totalTime / totalCalls : 0,
      slowCallThreshold: this.slowCallThreshold,
      totalSlowCalls,
      slowCallPercentage: totalCalls > 0 ? (totalSlowCalls / totalCalls) * 100 : 0,
      totalMemoryDelta,
      channelMetrics: Object.fromEntries(this.metrics),
      mostUsedChannels,
      slowestChannels,
      recommendations: this.generateRecommendations(allMetrics),
    };

    this.onPerformanceReport?.(report);
    return report;
  }

  private generateRecommendations(metrics: IpcPerformanceMetrics[]): string[] {
    const recommendations: string[] = [];

    // Check for slow channels
    const slowChannels = metrics.filter(m => m.averageTime > this.slowCallThreshold);
    if (slowChannels.length > 0) {
      recommendations.push(
        `Consider optimizing these slow channels: ${slowChannels.map(m => m.channel).join(', ')}`,
      );
    }

    // Check for high failure rates
    const failingChannels = metrics.filter(m => {
      const failureRate = m.totalCalls > 0 ? (m.failedCalls / m.totalCalls) * 100 : 0;
      return failureRate > 5; // More than 5% failure rate
    });
    if (failingChannels.length > 0) {
      recommendations.push(
        `High failure rates detected in: ${failingChannels.map(m => m.channel).join(', ')}`,
      );
    }

    // Check for memory leaks
    const memoryLeakChannels = metrics.filter(m => m.totalMemoryDelta > 1024 * 1024); // 1MB
    if (memoryLeakChannels.length > 0) {
      recommendations.push(
        `Potential memory leaks in: ${memoryLeakChannels.map(m => m.channel).join(', ')}`,
      );
    }

    // Check for overused channels
    const totalCalls = metrics.reduce((sum, m) => sum + m.totalCalls, 0);
    const overusedChannels = metrics.filter(m => {
      const usagePercentage = totalCalls > 0 ? (m.totalCalls / totalCalls) * 100 : 0;
      return usagePercentage > 50; // Single channel accounts for more than 50% of calls
    });
    if (overusedChannels.length > 0) {
      recommendations.push(
        `Consider batching or caching for heavily used channels: ${overusedChannels.map(m => m.channel).join(', ')}`,
      );
    }

    return recommendations;
  }

  resetMetrics(channel?: string): void {
    if (channel) {
      this.metrics.delete(channel);
    } else {
      this.metrics.clear();
    }
  }

  setSlowCallThreshold(threshold: number): void {
    this.slowCallThreshold = threshold;
  }

  enableMemoryTracking(enabled: boolean): void {
    this.memoryTrackingEnabled = enabled;
  }

  startReporting(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
    }

    this.reportingTimer = setInterval(() => {
      this.generateReport();
    }, this.reportingInterval);
  }

  stopReporting(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
      this.reportingTimer = undefined;
    }
  }

  private getMemoryUsage(): NodeJS.MemoryUsage | null {
    if (!this.memoryTrackingEnabled) {
      return null;
    }

    try {
      return process.memoryUsage();
    } catch {
      return null;
    }
  }

  private createEmptyMetrics(channel: string): IpcPerformanceMetrics {
    return {
      channel,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: 0,
      maxTime: 0,
      slowCalls: 0,
      lastCallTime: 0,
      memoryDelta: 0,
      totalMemoryDelta: 0,
    };
  }
}
