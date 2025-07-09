/**
 * Query performance monitoring system
 */
import { QueryMetrics } from './QueryMetrics';
import { QueryStats } from './QueryStats';

export class QueryMonitor {
  private metrics: QueryMetrics[] = [];
  private isEnabled: boolean = true;
  private maxMetricsHistory: number = 1000;

  /**
   * Enable or disable query monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set maximum number of metrics to keep in history
   */
  setMaxHistory(max: number): void {
    this.maxMetricsHistory = max;
  }

  /**
   * Execute a query with performance monitoring
   */
  executeWithMonitoring<T>(queryName: string, operation: () => T, parameters?: unknown[]): T {
    if (!this.isEnabled) {
      return operation();
    }

    const startTime = performance.now();
    let result: T;
    let rowsAffected = 0;

    try {
      result = operation();

      // Extract rows affected if result is a statement run result
      if (result && typeof result === 'object' && 'changes' in result) {
        rowsAffected = (result as { changes: number }).changes;
      }
    } catch (error) {
      // Still record the metrics even if query failed
      const executionTime = performance.now() - startTime;
      this.recordMetrics(queryName, executionTime, 0, parameters);
      throw error;
    }

    const executionTime = performance.now() - startTime;
    this.recordMetrics(queryName, executionTime, rowsAffected, parameters);

    return result;
  }

  /**
   * Record query metrics
   */
  private recordMetrics(
    queryName: string,
    executionTime: number,
    rowsAffected: number,
    parameters?: unknown[],
  ): void {
    const metric: QueryMetrics = {
      queryName,
      executionTime,
      rowsAffected,
      timestamp: Date.now(),
      parameters: parameters ? [...parameters] : undefined,
    };

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Get statistics for a specific query
   */
  getQueryStats(queryName: string): QueryStats | null {
    const queryMetrics = this.metrics.filter(m => m.queryName === queryName);

    if (queryMetrics.length === 0) {
      return null;
    }

    const executionTimes = queryMetrics.map(m => m.executionTime);
    const totalTime = executionTimes.reduce((sum, time) => sum + time, 0);

    return {
      queryName,
      totalExecutions: queryMetrics.length,
      totalTime,
      averageTime: totalTime / queryMetrics.length,
      minTime: Math.min(...executionTimes),
      maxTime: Math.max(...executionTimes),
      lastExecuted: Math.max(...queryMetrics.map(m => m.timestamp)),
    };
  }

  /**
   * Get all query statistics
   */
  getAllQueryStats(): QueryStats[] {
    const queryNames = [...new Set(this.metrics.map(m => m.queryName))];
    return queryNames
      .map(name => this.getQueryStats(name))
      .filter((stats): stats is QueryStats => stats !== null)
      .sort((a, b) => b.totalTime - a.totalTime);
  }

  /**
   * Get slow queries (above threshold in milliseconds)
   */
  getSlowQueries(thresholdMs: number = 100): QueryMetrics[] {
    return this.metrics
      .filter(m => m.executionTime > thresholdMs)
      .sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * Get recent metrics (last N entries)
   */
  getRecentMetrics(limit: number = 50): QueryMetrics[] {
    return this.metrics.slice(-limit).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get summary of performance metrics
   */
  getPerformanceSummary(): {
    totalQueries: number;
    averageExecutionTime: number;
    slowestQuery: QueryMetrics | null;
    mostFrequentQuery: string | null;
  } {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        slowestQuery: null,
        mostFrequentQuery: null,
      };
    }

    const totalTime = this.metrics.reduce((sum, m) => sum + m.executionTime, 0);
    const slowestQuery = this.metrics.reduce((slowest, current) =>
      current.executionTime > slowest.executionTime ? current : slowest,
    );

    // Find most frequent query
    const queryFrequency = this.metrics.reduce(
      (freq, m) => {
        freq[m.queryName] = (freq[m.queryName] || 0) + 1;
        return freq;
      },
      {} as Record<string, number>,
    );

    const mostFrequentQuery =
      Object.entries(queryFrequency).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    return {
      totalQueries: this.metrics.length,
      averageExecutionTime: totalTime / this.metrics.length,
      slowestQuery,
      mostFrequentQuery,
    };
  }
}
