/**
 * Performance monitoring system for Zustand store operations.
 *
 * This class provides comprehensive monitoring of store operations including:
 * - Action execution time
 * - State size changes
 * - Memory usage tracking
 * - Frequency monitoring
 * - Performance alerts and recommendations
 *
 * Integrates with existing performance monitoring infrastructure.
 */

import type {
  PerformanceThresholds,
  OperationMetadata,
  OperationRecord,
  OperationMetrics,
  OperationPerformanceData,
  GlobalOperationMetrics,
} from './types';

export class StoreOperationPerformanceMonitor {
  private static instance: StoreOperationPerformanceMonitor;
  private operationMetrics = new Map<string, OperationMetrics>();
  private isEnabled = false;
  private monitoringInterval: number | null = null;
  private subscribers: Array<(metrics: GlobalOperationMetrics) => void> = [];
  private performanceThresholds: PerformanceThresholds = {
    slowOperationMs: 2,
    bulkOperationMs: 10,
    stateSizeWarningMB: 5,
    stateSizeLimitMB: 10,
    memoryLeakThresholdMB: 50,
    highFrequencyCallsPerSecond: 20,
  };

  /**
   * Gets the singleton instance of the store operation performance monitor.
   */
  static getInstance(): StoreOperationPerformanceMonitor {
    if (!StoreOperationPerformanceMonitor.instance) {
      StoreOperationPerformanceMonitor.instance = new StoreOperationPerformanceMonitor();
    }
    return StoreOperationPerformanceMonitor.instance;
  }

  /**
   * Enables store operation performance monitoring.
   * @param intervalMs - Interval in milliseconds for periodic metrics collection
   */
  enable(intervalMs: number = 10000): void {
    this.isEnabled = true;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = window.setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    console.warn('🏪 Store Operation Performance Monitor enabled');
  }

  /**
   * Disables store operation performance monitoring.
   */
  disable(): void {
    this.isEnabled = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.warn('🏪 Store Operation Performance Monitor disabled');
  }

  /**
   * Monitors a store operation and tracks its performance.
   * @param operationName - Name of the store operation
   * @param operation - The operation to monitor
   * @param metadata - Additional metadata about the operation
   * @returns The result of the operation
   */
  async monitorOperation<T>(
    operationName: string,
    operation: () => T | Promise<T>,
    metadata: OperationMetadata = {},
  ): Promise<T> {
    if (!this.isEnabled) {
      return operation();
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    const beforeStateSize = this.getStateSize();

    let result: T;
    let error: Error | null = null;

    try {
      result = await operation();
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      throw error;
    } finally {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      const afterStateSize = this.getStateSize();

      this.recordOperation(operationName, {
        executionTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        stateSizeChange: afterStateSize - beforeStateSize,
        beforeStateSize,
        afterStateSize,
        success: error === null,
        error,
        metadata,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Monitors a synchronous store operation.
   * @param operationName - Name of the store operation
   * @param operation - The operation to monitor
   * @param metadata - Additional metadata about the operation
   * @returns The result of the operation
   */
  monitorSyncOperation<T>(
    operationName: string,
    operation: () => T,
    metadata: OperationMetadata = {},
  ): T {
    if (!this.isEnabled) {
      return operation();
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    const beforeStateSize = this.getStateSize();

    let result: T;
    let error: Error | null = null;

    try {
      result = operation();
    } catch (e) {
      error = e instanceof Error ? e : new Error(String(e));
      throw error;
    } finally {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      const afterStateSize = this.getStateSize();

      this.recordOperation(operationName, {
        executionTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        stateSizeChange: afterStateSize - beforeStateSize,
        beforeStateSize,
        afterStateSize,
        success: error === null,
        error,
        metadata,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Records a store operation performance record.
   */
  private recordOperation(operationName: string, record: OperationRecord): void {
    if (!this.operationMetrics.has(operationName)) {
      this.operationMetrics.set(operationName, {
        operationName,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        minExecutionTime: Number.MAX_VALUE,
        maxExecutionTime: 0,
        totalMemoryUsage: 0,
        averageMemoryUsage: 0,
        totalStateSizeChange: 0,
        averageStateSizeChange: 0,
        recentRecords: [],
        errors: [],
        frequencyPerSecond: 0,
        lastCallTimestamp: 0,
      });
    }

    const metrics = this.operationMetrics.get(operationName);
    if (!metrics) {
      console.warn(`Operation metrics not found for ${operationName}`);
      return;
    }

    // Update metrics
    metrics.totalCalls++;
    if (record.success) {
      metrics.successfulCalls++;
    } else {
      metrics.failedCalls++;
      if (record.error && metrics.errors.length < 10) {
        metrics.errors.push({
          timestamp: record.timestamp,
          error: record.error,
          metadata: record.metadata,
        });
      }
    }

    metrics.totalExecutionTime += record.executionTime;
    metrics.averageExecutionTime = metrics.totalExecutionTime / metrics.totalCalls;
    metrics.minExecutionTime = Math.min(metrics.minExecutionTime, record.executionTime);
    metrics.maxExecutionTime = Math.max(metrics.maxExecutionTime, record.executionTime);

    metrics.totalMemoryUsage += record.memoryUsage;
    metrics.averageMemoryUsage = metrics.totalMemoryUsage / metrics.totalCalls;

    metrics.totalStateSizeChange += record.stateSizeChange;
    metrics.averageStateSizeChange = metrics.totalStateSizeChange / metrics.totalCalls;

    // Update frequency tracking
    const timeSinceLastCall = record.timestamp - metrics.lastCallTimestamp;
    if (timeSinceLastCall > 0) {
      metrics.frequencyPerSecond = 1000 / timeSinceLastCall;
    }
    metrics.lastCallTimestamp = record.timestamp;

    // Store recent records (last 20)
    metrics.recentRecords.push(record);
    if (metrics.recentRecords.length > 20) {
      metrics.recentRecords.shift();
    }

    // Check for performance issues
    this.checkPerformanceIssues(operationName, record, metrics);
  }

  /**
   * Checks for performance issues and logs warnings.
   */
  private checkPerformanceIssues(
    operationName: string,
    record: OperationRecord,
    metrics: OperationMetrics,
  ): void {
    const issues: string[] = [];

    // Check slow operations
    if (record.executionTime > this.performanceThresholds.slowOperationMs) {
      issues.push(`Slow operation: ${record.executionTime.toFixed(2)}ms`);
    }

    // Check bulk operations
    if (record.executionTime > this.performanceThresholds.bulkOperationMs) {
      issues.push(`Bulk operation detected: ${record.executionTime.toFixed(2)}ms`);
    }

    // Check state size growth
    const stateSizeMB = record.afterStateSize / (1024 * 1024);
    if (stateSizeMB > this.performanceThresholds.stateSizeWarningMB) {
      issues.push(`Large state size: ${stateSizeMB.toFixed(2)}MB`);
    }

    // Check memory leaks
    if (record.memoryUsage > this.performanceThresholds.memoryLeakThresholdMB * 1024 * 1024) {
      issues.push(`Memory leak detected: ${(record.memoryUsage / (1024 * 1024)).toFixed(2)}MB`);
    }

    // Check high frequency calls
    if (metrics.frequencyPerSecond > this.performanceThresholds.highFrequencyCallsPerSecond) {
      issues.push(`High frequency calls: ${metrics.frequencyPerSecond.toFixed(1)}/sec`);
    }

    if (issues.length > 0) {
      console.warn(`⚠️ Performance issues in store operation "${operationName}":`, issues);
    }
  }

  /**
   * Gets approximate memory usage.
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memoryInfo = (performance as { memory?: { usedJSHeapSize?: number } }).memory;
      return memoryInfo?.usedJSHeapSize ?? 0;
    }
    return 0;
  }

  /**
   * Gets approximate state size by serializing to JSON.
   */
  private getStateSize(): number {
    try {
      // Get store state if available
      if (typeof window !== 'undefined') {
        const zustandStore = (window as { __ZUSTAND_STORE__?: { getState: () => unknown } })
          .__ZUSTAND_STORE__;
        if (zustandStore && typeof zustandStore.getState === 'function') {
          const state = zustandStore.getState();
          return JSON.stringify(state).length;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Collects current metrics from all monitored operations.
   */
  private collectMetrics(): void {
    const globalMetrics: GlobalOperationMetrics = {
      timestamp: Date.now(),
      totalOperations: this.operationMetrics.size,
      totalCalls: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      slowOperations: [],
      frequentOperations: [],
      memoryIntensiveOperations: [],
      errorProneOperations: [],
      bulkOperations: [],
      operationDetails: [],
    };

    const operationData: OperationPerformanceData[] = [];

    this.operationMetrics.forEach((metrics, operationName) => {
      if (metrics.totalCalls > 0) {
        globalMetrics.totalCalls += metrics.totalCalls;
        globalMetrics.totalExecutionTime += metrics.totalExecutionTime;

        const operationPerfData: OperationPerformanceData = {
          operationName,
          metrics: { ...metrics },
          successRate: (metrics.successfulCalls / metrics.totalCalls) * 100,
          isHighFrequency:
            metrics.frequencyPerSecond > this.performanceThresholds.highFrequencyCallsPerSecond,
          isMemoryIntensive:
            metrics.averageMemoryUsage >
            this.performanceThresholds.memoryLeakThresholdMB * 1024 * 1024,
          hasRecentErrors: metrics.errors.length > 0,
        };

        operationData.push(operationPerfData);
        globalMetrics.operationDetails.push(operationPerfData);
      }
    });

    // Calculate global averages
    if (globalMetrics.totalCalls > 0) {
      globalMetrics.averageExecutionTime =
        globalMetrics.totalExecutionTime / globalMetrics.totalCalls;
    }

    // Identify slow operations
    globalMetrics.slowOperations = operationData
      .filter(
        data => data.metrics.averageExecutionTime > this.performanceThresholds.slowOperationMs,
      )
      .sort((a, b) => b.metrics.averageExecutionTime - a.metrics.averageExecutionTime)
      .slice(0, 5);

    // Identify frequent operations
    globalMetrics.frequentOperations = operationData
      .filter(data => data.isHighFrequency)
      .sort((a, b) => b.metrics.frequencyPerSecond - a.metrics.frequencyPerSecond)
      .slice(0, 5);

    // Identify memory intensive operations
    globalMetrics.memoryIntensiveOperations = operationData
      .filter(data => data.isMemoryIntensive)
      .sort((a, b) => b.metrics.averageMemoryUsage - a.metrics.averageMemoryUsage)
      .slice(0, 5);

    // Identify error prone operations
    globalMetrics.errorProneOperations = operationData
      .filter(data => data.hasRecentErrors)
      .sort((a, b) => b.metrics.failedCalls - a.metrics.failedCalls)
      .slice(0, 5);

    // Identify bulk operations
    globalMetrics.bulkOperations = operationData
      .filter(data => data.metrics.maxExecutionTime > this.performanceThresholds.bulkOperationMs)
      .sort((a, b) => b.metrics.maxExecutionTime - a.metrics.maxExecutionTime)
      .slice(0, 5);

    // Notify subscribers
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(globalMetrics);
      } catch (error) {
        console.warn('Error notifying store operation performance monitor subscriber:', error);
      }
    });

    // Log performance issues
    this.logPerformanceIssues(globalMetrics);
  }

  /**
   * Logs performance issues to the console.
   */
  private logPerformanceIssues(metrics: GlobalOperationMetrics): void {
    if (metrics.slowOperations.length > 0) {
      console.warn(
        '🐌 Slow store operations detected:',
        metrics.slowOperations.map(op => ({
          name: op.operationName,
          avgTime: `${op.metrics.averageExecutionTime.toFixed(2)}ms`,
          maxTime: `${op.metrics.maxExecutionTime.toFixed(2)}ms`,
          calls: op.metrics.totalCalls,
        })),
      );
    }

    if (metrics.frequentOperations.length > 0) {
      console.warn(
        '🔄 High frequency store operations detected:',
        metrics.frequentOperations.map(op => ({
          name: op.operationName,
          frequency: `${op.metrics.frequencyPerSecond.toFixed(1)}/sec`,
          calls: op.metrics.totalCalls,
        })),
      );
    }

    if (metrics.memoryIntensiveOperations.length > 0) {
      console.warn(
        '🧠 Memory intensive store operations detected:',
        metrics.memoryIntensiveOperations.map(op => ({
          name: op.operationName,
          avgMemory: `${(op.metrics.averageMemoryUsage / (1024 * 1024)).toFixed(2)}MB`,
          calls: op.metrics.totalCalls,
        })),
      );
    }

    if (metrics.errorProneOperations.length > 0) {
      console.warn(
        '❌ Error prone store operations detected:',
        metrics.errorProneOperations.map(op => ({
          name: op.operationName,
          errorRate: `${((op.metrics.failedCalls / op.metrics.totalCalls) * 100).toFixed(1)}%`,
          errors: op.metrics.errors.length,
        })),
      );
    }
  }

  /**
   * Subscribes to performance metrics updates.
   * @param callback - Function to call with metrics updates
   * @returns Unsubscribe function
   */
  subscribe(callback: (metrics: GlobalOperationMetrics) => void): () => void {
    this.subscribers.push(callback);

    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Gets current metrics for all monitored operations.
   */
  getCurrentMetrics(): GlobalOperationMetrics | null {
    if (!this.isEnabled) return null;

    // Force a metrics collection
    this.collectMetrics();

    const totalCalls = Array.from(this.operationMetrics.values()).reduce(
      (sum, metrics) => sum + metrics.totalCalls,
      0,
    );

    // Convert operation metrics to operation details
    const operationDetails: OperationPerformanceData[] = Array.from(
      this.operationMetrics.entries(),
    ).map(([operationName, metrics]) => ({
      operationName,
      metrics,
      successRate:
        metrics.totalCalls > 0 ? (metrics.successfulCalls / metrics.totalCalls) * 100 : 0,
      isHighFrequency:
        metrics.frequencyPerSecond > this.performanceThresholds.highFrequencyCallsPerSecond,
      isMemoryIntensive:
        metrics.averageMemoryUsage > this.performanceThresholds.memoryLeakThresholdMB * 1024 * 1024,
      hasRecentErrors: metrics.errors.length > 0,
    }));

    return {
      timestamp: Date.now(),
      totalOperations: this.operationMetrics.size,
      totalCalls,
      totalExecutionTime: Array.from(this.operationMetrics.values()).reduce(
        (sum, metrics) => sum + metrics.totalExecutionTime,
        0,
      ),
      averageExecutionTime:
        totalCalls > 0
          ? Array.from(this.operationMetrics.values()).reduce(
              (sum, metrics) => sum + metrics.totalExecutionTime,
              0,
            ) / totalCalls
          : 0,
      slowOperations: [],
      frequentOperations: [],
      memoryIntensiveOperations: [],
      errorProneOperations: [],
      bulkOperations: [],
      operationDetails,
    };
  }

  /**
   * Resets all metrics for all operations.
   */
  resetMetrics(): void {
    this.operationMetrics.clear();
    console.warn('🔄 All store operation metrics reset');
  }

  /**
   * Gets a performance report as a formatted string.
   */
  getPerformanceReport(): string {
    const metrics = this.getCurrentMetrics();
    if (!metrics) return 'Store operation performance monitoring is disabled';

    return `
🏪 Store Operation Performance Report
===================================
Total Operations: ${metrics.totalOperations}
Total Calls: ${metrics.totalCalls}
Average Execution Time: ${metrics.averageExecutionTime.toFixed(2)}ms
Total Execution Time: ${metrics.totalExecutionTime.toFixed(2)}ms

${
  metrics.slowOperations.length > 0
    ? `
⚠️ Slow Operations (>${this.performanceThresholds.slowOperationMs}ms):
${metrics.slowOperations
  .map(
    op =>
      `• ${op.operationName}: ${op.metrics.averageExecutionTime.toFixed(2)}ms avg (${op.metrics.maxExecutionTime.toFixed(2)}ms max)`,
  )
  .join('\n')}
`
    : ''
}

${
  metrics.frequentOperations.length > 0
    ? `
🔄 High Frequency Operations (>${this.performanceThresholds.highFrequencyCallsPerSecond}/sec):
${metrics.frequentOperations
  .map(
    op =>
      `• ${op.operationName}: ${op.metrics.frequencyPerSecond.toFixed(1)}/sec (${op.metrics.totalCalls} calls)`,
  )
  .join('\n')}
`
    : ''
}

${
  metrics.memoryIntensiveOperations.length > 0
    ? `
🧠 Memory Intensive Operations:
${metrics.memoryIntensiveOperations
  .map(
    op =>
      `• ${op.operationName}: ${(op.metrics.averageMemoryUsage / (1024 * 1024)).toFixed(2)}MB avg`,
  )
  .join('\n')}
`
    : ''
}

${
  metrics.errorProneOperations.length > 0
    ? `
❌ Error Prone Operations:
${metrics.errorProneOperations
  .map(
    op =>
      `• ${op.operationName}: ${((op.metrics.failedCalls / op.metrics.totalCalls) * 100).toFixed(1)}% error rate`,
  )
  .join('\n')}
`
    : ''
}
    `.trim();
  }

  /**
   * Updates performance thresholds.
   */
  updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.performanceThresholds = { ...this.performanceThresholds, ...thresholds };
    console.warn('🎯 Store operation performance thresholds updated');
  }

  /**
   * Gets current performance thresholds.
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.performanceThresholds };
  }
}
