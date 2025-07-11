import type { SelectorWithMetrics } from './SelectorWithMetrics';

/**
 * Global performance monitoring system for memoized selectors.
 */
export class SelectorPerformanceMonitor {
  private static instance: SelectorPerformanceMonitor;
  private selectorMetrics = new Map<string, SelectorMetrics>();
  private isEnabled = false;
  private monitoringInterval: number | null = null;
  private subscribers: Array<(metrics: GlobalMetrics) => void> = [];

  /**
   * Gets the singleton instance of the performance monitor.
   */
  static getInstance(): SelectorPerformanceMonitor {
    if (!SelectorPerformanceMonitor.instance) {
      SelectorPerformanceMonitor.instance = new SelectorPerformanceMonitor();
    }
    return SelectorPerformanceMonitor.instance;
  }

  /**
   * Enables performance monitoring.
   * @param intervalMs - Interval in milliseconds for periodic metrics collection
   */
  enable(intervalMs: number = 5000): void {
    this.isEnabled = true;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = window.setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    console.warn('🎯 Selector Performance Monitor enabled');
  }

  /**
   * Disables performance monitoring.
   */
  disable(): void {
    this.isEnabled = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.warn('🎯 Selector Performance Monitor disabled');
  }

  /**
   * Registers a selector for performance monitoring.
   * @param selectorName - Name of the selector
   * @param selector - The selector function with metrics
   */
  registerSelector(selectorName: string, selector: SelectorWithMetrics): void {
    if (!this.isEnabled) return;

    this.selectorMetrics.set(selectorName, {
      selectorName,
      selector,
      lastSnapshot: null,
      history: [],
    });
  }

  /**
   * Unregisters a selector from performance monitoring.
   * @param selectorName - Name of the selector to unregister
   */
  unregisterSelector(selectorName: string): void {
    this.selectorMetrics.delete(selectorName);
  }

  /**
   * Collects current metrics from all registered selectors.
   */
  private collectMetrics(): void {
    const globalMetrics: GlobalMetrics = {
      timestamp: Date.now(),
      totalSelectors: this.selectorMetrics.size,
      activeSelectors: 0,
      totalCalls: 0,
      totalCacheHits: 0,
      totalCacheMisses: 0,
      averageExecutionTime: 0,
      slowSelectors: [],
      mostUsedSelectors: [],
      leastEfficientSelectors: [],
      selectorDetails: [],
    };

    const selectorPerformanceData: SelectorPerformanceData[] = [];

    this.selectorMetrics.forEach((metrics, selectorName) => {
      try {
        const currentMetrics = metrics.selector.getMetrics();

        if (currentMetrics.totalCalls > 0) {
          globalMetrics.activeSelectors++;
          globalMetrics.totalCalls += currentMetrics.totalCalls;
          globalMetrics.totalCacheHits += currentMetrics.cacheHits;
          globalMetrics.totalCacheMisses += currentMetrics.cacheMisses;

          const selectorData: SelectorPerformanceData = {
            selectorName,
            metrics: currentMetrics,
            cacheHitRatio:
              currentMetrics.totalCalls > 0
                ? (currentMetrics.cacheHits / currentMetrics.totalCalls) * 100
                : 0,
            isActive: currentMetrics.totalCalls > (metrics.lastSnapshot?.metrics.totalCalls ?? 0),
            callsSinceLastSnapshot:
              currentMetrics.totalCalls - (metrics.lastSnapshot?.metrics.totalCalls ?? 0),
          };

          selectorPerformanceData.push(selectorData);
          globalMetrics.selectorDetails.push(selectorData);

          // Update last snapshot
          metrics.lastSnapshot = {
            timestamp: Date.now(),
            metrics: { ...currentMetrics },
          };

          // Keep history (last 10 snapshots)
          metrics.history.push({
            timestamp: Date.now(),
            metrics: { ...currentMetrics },
          });

          if (metrics.history.length > 10) {
            metrics.history.shift();
          }
        }
      } catch (error) {
        console.warn(`Failed to collect metrics for selector ${selectorName}:`, error);
      }
    });

    // Calculate global averages
    if (globalMetrics.activeSelectors > 0) {
      globalMetrics.averageExecutionTime =
        selectorPerformanceData.reduce((sum, data) => sum + data.metrics.averageExecutionTime, 0) /
        globalMetrics.activeSelectors;
    }

    // Identify slow selectors (above 1ms average)
    globalMetrics.slowSelectors = selectorPerformanceData
      .filter(data => data.metrics.averageExecutionTime > 1)
      .sort((a, b) => b.metrics.averageExecutionTime - a.metrics.averageExecutionTime)
      .slice(0, 5);

    // Identify most used selectors
    globalMetrics.mostUsedSelectors = selectorPerformanceData
      .sort((a, b) => b.metrics.totalCalls - a.metrics.totalCalls)
      .slice(0, 5);

    // Identify least efficient selectors (low cache hit ratio)
    globalMetrics.leastEfficientSelectors = selectorPerformanceData
      .filter(data => data.metrics.totalCalls > 10) // Only consider selectors with significant usage
      .sort((a, b) => a.cacheHitRatio - b.cacheHitRatio)
      .slice(0, 5);

    // Notify subscribers
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(globalMetrics);
      } catch (error) {
        console.warn('Error notifying performance monitor subscriber:', error);
      }
    });

    // Log performance issues
    this.logPerformanceIssues(globalMetrics);
  }

  /**
   * Logs performance issues to the console.
   */
  private logPerformanceIssues(metrics: GlobalMetrics): void {
    if (metrics.slowSelectors.length > 0) {
      console.warn(
        '🐌 Slow selectors detected:',
        metrics.slowSelectors.map(s => ({
          name: s.selectorName,
          avgTime: `${s.metrics.averageExecutionTime.toFixed(2)}ms`,
          calls: s.metrics.totalCalls,
        })),
      );
    }

    if (metrics.leastEfficientSelectors.length > 0) {
      console.warn(
        '⚡ Inefficient selectors detected:',
        metrics.leastEfficientSelectors.map(s => ({
          name: s.selectorName,
          hitRatio: `${s.cacheHitRatio.toFixed(1)}%`,
          calls: s.metrics.totalCalls,
        })),
      );
    }

    // Log overall cache performance
    const overallHitRatio =
      metrics.totalCalls > 0 ? (metrics.totalCacheHits / metrics.totalCalls) * 100 : 0;

    if (overallHitRatio < 80 && metrics.totalCalls > 100) {
      console.warn(`📊 Overall cache hit ratio is low: ${overallHitRatio.toFixed(1)}%`);
    }
  }

  /**
   * Subscribes to performance metrics updates.
   * @param callback - Function to call with metrics updates
   * @returns Unsubscribe function
   */
  subscribe(callback: (metrics: GlobalMetrics) => void): () => void {
    this.subscribers.push(callback);

    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Gets current metrics for all registered selectors.
   */
  getCurrentMetrics(): GlobalMetrics | null {
    if (!this.isEnabled) return null;

    // Force a metrics collection
    this.collectMetrics();

    return {
      timestamp: Date.now(),
      totalSelectors: this.selectorMetrics.size,
      activeSelectors: Array.from(this.selectorMetrics.values()).filter(
        m => m.selector.getMetrics().totalCalls > 0,
      ).length,
      totalCalls: Array.from(this.selectorMetrics.values()).reduce(
        (sum, m) => sum + m.selector.getMetrics().totalCalls,
        0,
      ),
      totalCacheHits: Array.from(this.selectorMetrics.values()).reduce(
        (sum, m) => sum + m.selector.getMetrics().cacheHits,
        0,
      ),
      totalCacheMisses: Array.from(this.selectorMetrics.values()).reduce(
        (sum, m) => sum + m.selector.getMetrics().cacheMisses,
        0,
      ),
      averageExecutionTime: 0, // Will be calculated in collectMetrics
      slowSelectors: [],
      mostUsedSelectors: [],
      leastEfficientSelectors: [],
      selectorDetails: [],
    };
  }

  /**
   * Gets historical metrics for a specific selector.
   * @param selectorName - Name of the selector
   * @returns Array of historical metrics snapshots
   */
  getSelectorHistory(selectorName: string): MetricsSnapshot[] {
    const metrics = this.selectorMetrics.get(selectorName);
    return metrics?.history ?? [];
  }

  /**
   * Resets all metrics for all selectors.
   */
  resetMetrics(): void {
    this.selectorMetrics.forEach(metrics => {
      metrics.selector.clearCache();
      metrics.lastSnapshot = null;
      metrics.history = [];
    });

    console.warn('🔄 All selector metrics reset');
  }

  /**
   * Gets a performance report as a formatted string.
   */
  getPerformanceReport(): string {
    const metrics = this.getCurrentMetrics();
    if (!metrics) return 'Performance monitoring is disabled';

    const overallHitRatio =
      metrics.totalCalls > 0 ? (metrics.totalCacheHits / metrics.totalCalls) * 100 : 0;

    return `
🎯 Selector Performance Report
=============================
Total Selectors: ${metrics.totalSelectors}
Active Selectors: ${metrics.activeSelectors}
Total Calls: ${metrics.totalCalls}
Cache Hit Ratio: ${overallHitRatio.toFixed(1)}%
Average Execution Time: ${metrics.averageExecutionTime.toFixed(2)}ms

Top 5 Most Used Selectors:
${metrics.mostUsedSelectors
  .map(
    s =>
      `• ${s.selectorName}: ${s.metrics.totalCalls} calls (${s.cacheHitRatio.toFixed(1)}% hit ratio)`,
  )
  .join('\n')}

${
  metrics.slowSelectors.length > 0
    ? `
⚠️ Slow Selectors (>1ms avg):
${metrics.slowSelectors
  .map(s => `• ${s.selectorName}: ${s.metrics.averageExecutionTime.toFixed(2)}ms average`)
  .join('\n')}
`
    : ''
}

${
  metrics.leastEfficientSelectors.length > 0
    ? `
⚠️ Inefficient Selectors (<80% hit ratio):
${metrics.leastEfficientSelectors
  .map(s => `• ${s.selectorName}: ${s.cacheHitRatio.toFixed(1)}% hit ratio`)
  .join('\n')}
`
    : ''
}
`.trim();
  }
}

/**
 * Metrics data for a single selector.
 */
interface SelectorMetrics {
  selectorName: string;
  selector: SelectorWithMetrics;
  lastSnapshot: MetricsSnapshot | null;
  history: MetricsSnapshot[];
}

/**
 * Snapshot of metrics at a specific point in time.
 */
interface MetricsSnapshot {
  timestamp: number;
  metrics: {
    totalCalls: number;
    cacheHits: number;
    cacheMisses: number;
    averageExecutionTime: number;
    [key: string]: unknown;
  };
}

/**
 * Performance data for a single selector.
 */
interface SelectorPerformanceData {
  selectorName: string;
  metrics: {
    totalCalls: number;
    cacheHits: number;
    cacheMisses: number;
    averageExecutionTime: number;
    [key: string]: unknown;
  };
  cacheHitRatio: number;
  isActive: boolean;
  callsSinceLastSnapshot: number;
}

/**
 * Global metrics across all selectors.
 */
interface GlobalMetrics {
  timestamp: number;
  totalSelectors: number;
  activeSelectors: number;
  totalCalls: number;
  totalCacheHits: number;
  totalCacheMisses: number;
  averageExecutionTime: number;
  slowSelectors: SelectorPerformanceData[];
  mostUsedSelectors: SelectorPerformanceData[];
  leastEfficientSelectors: SelectorPerformanceData[];
  selectorDetails: SelectorPerformanceData[];
}
