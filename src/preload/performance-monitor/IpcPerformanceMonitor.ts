import type { IpcPerformanceMetrics } from './IpcPerformanceMetrics';
import type { IpcPerformanceStats } from './IpcPerformanceStats';

class IpcPerformanceMonitor {
  private metrics: IpcPerformanceMetrics[] = [];
  private stats: Map<string, IpcPerformanceStats> = new Map();
  private readonly maxMetricsStorage = 1000;
  private readonly isDev = process.env.NODE_ENV === 'development';

  /**
   * Start monitoring an IPC call
   */
  startCall(channel: string, payload?: unknown): string {
    const callId = `${channel}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const startTime = performance.now();

    const metric: IpcPerformanceMetrics = {
      channel,
      startTime,
      success: false,
      payloadSize: this.calculatePayloadSize(payload),
    };

    this.metrics.push(metric);

    // Keep only the last N metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetricsStorage) {
      this.metrics.shift();
    }

    return callId;
  }

  /**
   * End monitoring an IPC call
   */
  endCall(callId: string, success: boolean, error?: string): void {
    const endTime = performance.now();
    const [channel] = callId.split('-');

    // Find the most recent metric by channel that hasn't been completed yet
    const metric = this.metrics
      .filter(m => m.channel === channel && !m.endTime)
      .sort((a, b) => b.startTime - a.startTime)[0];

    if (metric) {
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      metric.success = success;
      metric.error = error;

      this.updateStats(metric);
    }

    // Log slow calls in development
    if (this.isDev && metric?.duration && metric.duration > 100) {
      console.warn(`Slow IPC call detected: ${channel} took ${metric.duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get performance statistics for a channel
   */
  getStats(channel: string): IpcPerformanceStats | undefined {
    return this.stats.get(channel);
  }

  /**
   * Get all performance statistics
   */
  getAllStats(): Record<string, IpcPerformanceStats> {
    return Object.fromEntries(this.stats.entries());
  }

  /**
   * Clear all metrics and statistics
   */
  clearStats(): void {
    this.metrics.length = 0;
    this.stats.clear();
  }

  /**
   * Get recent metrics for debugging
   */
  getRecentMetrics(limit: number = 10): IpcPerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  private calculatePayloadSize(payload: unknown): number {
    if (!payload) return 0;

    try {
      return JSON.stringify(payload).length;
    } catch {
      return 0;
    }
  }

  private updateStats(metric: IpcPerformanceMetrics): void {
    if (!metric.duration) return;

    const existing = this.stats.get(metric.channel);

    if (existing) {
      existing.totalCalls++;
      existing.lastCallTime = Date.now();

      if (metric.success) {
        existing.successfulCalls++;
      } else {
        existing.failedCalls++;
      }

      // Update duration stats
      const totalDuration = existing.averageDuration * (existing.totalCalls - 1) + metric.duration;
      existing.averageDuration = totalDuration / existing.totalCalls;
      existing.minDuration = Math.min(existing.minDuration, metric.duration);
      existing.maxDuration = Math.max(existing.maxDuration, metric.duration);
    } else {
      this.stats.set(metric.channel, {
        totalCalls: 1,
        successfulCalls: metric.success ? 1 : 0,
        failedCalls: metric.success ? 0 : 1,
        averageDuration: metric.duration,
        minDuration: metric.duration,
        maxDuration: metric.duration,
        lastCallTime: Date.now(),
      });
    }
  }
}

export const ipcPerformanceMonitor = new IpcPerformanceMonitor();
