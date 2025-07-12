/**
 * IPC performance monitoring class
 */

import { IpcPerformanceMetrics } from './performance-metrics';

export class IpcPerformanceMonitor {
  private metrics: IpcPerformanceMetrics[] = [];
  private maxMetrics = 100;

  startCall(_channel: string): number {
    return performance.now();
  }

  endCall(channel: string, startTime: number, success: boolean, error?: Error): void {
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.metrics.push({
      channel,
      startTime,
      endTime,
      duration,
      success,
      error: error?.message,
    });

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): IpcPerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(channel?: string): number {
    const filteredMetrics = channel
      ? this.metrics.filter(m => m.channel === channel)
      : this.metrics;

    if (filteredMetrics.length === 0) return 0;

    const totalDuration = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / filteredMetrics.length;
  }

  getSuccessRate(channel?: string): number {
    const filteredMetrics = channel
      ? this.metrics.filter(m => m.channel === channel)
      : this.metrics;

    if (filteredMetrics.length === 0) return 0;

    const successCount = filteredMetrics.filter(m => m.success).length;
    return successCount / filteredMetrics.length;
  }

  clear(): void {
    this.metrics = [];
  }
}
