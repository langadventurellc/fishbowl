import type { IpcPerformanceMetrics } from './IpcPerformanceMetrics';
import type { IpcPerformanceReport } from './IpcPerformanceReport';
import type { OptimizationRule } from './OptimizationRule';
import type { OptimizationResult } from './OptimizationResult';

interface CacheEntry {
  value: unknown;
  timestamp: number;
}

interface CacheConfig {
  enabled: boolean;
  data: Map<string, CacheEntry>;
  ttl: number;
  maxSize: number;
}

interface BatchRequest<T> {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  args: () => Promise<T>;
}

export class IpcPerformanceOptimizer {
  private rules: OptimizationRule[] = [];
  private cache: Map<string, CacheConfig> = new Map();
  private batchRequests: Map<string, Array<BatchRequest<unknown>>> = new Map();
  private onOptimization?: (result: OptimizationResult) => void;

  constructor(config?: { onOptimization?: (result: OptimizationResult) => void }) {
    this.onOptimization = config?.onOptimization;
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Rule 1: Cache frequently accessed data
    this.addRule({
      name: 'cache-frequent-reads',
      condition: metrics => {
        return (
          (metrics.totalCalls > 10 &&
            metrics.averageTime > 50 &&
            metrics.channel.includes('get')) ||
          metrics.channel.includes('list')
        );
      },
      action: async (channel, _metrics) => {
        // Implement caching logic for read operations
        this.enableCaching(channel);
        await Promise.resolve();
      },
      priority: 1,
    });

    // Rule 2: Batch small frequent operations
    this.addRule({
      name: 'batch-small-operations',
      condition: metrics => {
        return (
          metrics.totalCalls > 20 &&
          metrics.averageTime < 10 &&
          (metrics.channel.includes('create') || metrics.channel.includes('update'))
        );
      },
      action: async (channel, _metrics) => {
        // Implement batching for small operations
        this.enableBatching(channel);
        await Promise.resolve();
      },
      priority: 2,
    });

    // Rule 3: Optimize slow operations
    this.addRule({
      name: 'optimize-slow-operations',
      condition: metrics => {
        return metrics.averageTime > 200 || metrics.slowCalls > 5;
      },
      action: async (channel, metrics) => {
        // Log slow operations for manual optimization
        this.logSlowOperation(channel, metrics);
        await Promise.resolve();
      },
      priority: 3,
    });

    // Rule 4: Memory leak prevention
    this.addRule({
      name: 'prevent-memory-leaks',
      condition: metrics => {
        return metrics.totalMemoryDelta > 5 * 1024 * 1024; // 5MB
      },
      action: async (channel, metrics) => {
        // Force garbage collection and log memory usage
        this.optimizeMemoryUsage(channel, metrics);
        await Promise.resolve();
      },
      priority: 1,
    });
  }

  addRule(rule: OptimizationRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  removeRule(name: string): void {
    this.rules = this.rules.filter(rule => rule.name !== name);
  }

  async optimizeFromReport(report: IpcPerformanceReport): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    for (const [channel, metrics] of Object.entries(report.channelMetrics)) {
      const channelResults = await this.optimizeChannel(channel, metrics);
      results.push(...channelResults);
    }

    return results;
  }

  async optimizeChannel(
    channel: string,
    metrics: IpcPerformanceMetrics,
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    for (const rule of this.rules) {
      if (rule.condition(metrics)) {
        const result = await this.applyRule(rule, channel, metrics);
        results.push(result);

        if (this.onOptimization) {
          this.onOptimization(result);
        }
      }
    }

    return results;
  }

  private async applyRule(
    rule: OptimizationRule,
    channel: string,
    metrics: IpcPerformanceMetrics,
  ): Promise<OptimizationResult> {
    const beforeTime = metrics.averageTime;

    try {
      await rule.action(channel, metrics);

      return {
        channel,
        ruleName: rule.name,
        applied: true,
        improvement: {
          beforeTime,
          afterTime: beforeTime, // Would be updated with actual measurement
          percentageImprovement: 0, // Would be calculated with actual measurement
        },
      };
    } catch (error) {
      return {
        channel,
        ruleName: rule.name,
        applied: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private enableCaching(channel: string): void {
    // Simple in-memory cache implementation
    const cacheKey = `cache:${channel}`;
    if (!this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, {
        enabled: true,
        data: new Map(),
        ttl: 300000, // 5 minutes
        maxSize: 100,
      });
    }
  }

  private enableBatching(channel: string): void {
    // Enable request batching for the channel
    if (!this.batchRequests.has(channel)) {
      this.batchRequests.set(channel, []);
    }
  }

  private logSlowOperation(channel: string, metrics: IpcPerformanceMetrics): void {
    console.warn(`Slow IPC operation detected: ${channel}`, {
      averageTime: metrics.averageTime,
      slowCalls: metrics.slowCalls,
      recommendations: [
        'Consider adding database indexes',
        'Optimize query complexity',
        'Consider pagination for large datasets',
        'Check for N+1 query problems',
      ],
    });
  }

  private optimizeMemoryUsage(channel: string, metrics: IpcPerformanceMetrics): void {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    console.warn(`Memory usage optimization for channel: ${channel}`, {
      totalMemoryDelta: metrics.totalMemoryDelta,
      recommendations: [
        'Check for memory leaks in handlers',
        'Ensure proper cleanup of resources',
        'Consider using object pooling',
        'Monitor object retention',
      ],
    });
  }

  // Utility methods for cache management
  getCachedValue(channel: string, key: string): unknown {
    const cacheKey = `cache:${channel}`;
    const cache = this.cache.get(cacheKey);

    if (cache?.enabled) {
      const entry = cache.data.get(key);
      if (entry && Date.now() - entry.timestamp < cache.ttl) {
        return entry.value;
      }
    }

    return null;
  }

  setCachedValue(channel: string, key: string, value: unknown): void {
    const cacheKey = `cache:${channel}`;
    const cache = this.cache.get(cacheKey);

    if (cache?.enabled) {
      // Implement LRU eviction if cache is full
      if (cache.data.size >= cache.maxSize) {
        const firstKey = cache.data.keys().next().value;
        if (firstKey !== undefined) {
          cache.data.delete(firstKey);
        }
      }

      cache.data.set(key, {
        value,
        timestamp: Date.now(),
      });
    }
  }

  clearCache(channel?: string): void {
    if (channel) {
      const cacheKey = `cache:${channel}`;
      const cache = this.cache.get(cacheKey);
      if (cache) {
        cache.data.clear();
      }
    } else {
      this.cache.clear();
    }
  }

  // Batching utility
  addToBatch<T>(channel: string, operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const batch = this.batchRequests.get(channel) ?? [];
      batch.push({
        resolve: resolve as (value: unknown) => void,
        reject,
        args: operation as () => Promise<unknown>,
      });
      this.batchRequests.set(channel, batch);

      // Process batch after a short delay
      setTimeout(() => {
        void this.processBatch(channel);
      }, 10);
    });
  }

  private async processBatch(channel: string): Promise<void> {
    const batch = this.batchRequests.get(channel);
    if (!batch || batch.length === 0) {
      return;
    }

    // Clear the batch
    this.batchRequests.set(channel, []);

    try {
      // Execute all operations in the batch
      const results = await Promise.allSettled(batch.map(item => item.args()));

      // Resolve/reject individual promises
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          (batch[index].resolve as (value: unknown) => void)(result.value);
        } else {
          batch[index].reject(result.reason);
        }
      });
    } catch (error: unknown) {
      // Reject all if batch processing fails
      batch.forEach(item => item.reject(error));
    }
  }

  getOptimizationStats(): {
    cacheStats: Record<string, { hits: number; misses: number; size: number }>;
    batchStats: Record<string, { batchCount: number; averageBatchSize: number }>;
    rulesApplied: Record<string, number>;
  } {
    // Return optimization statistics
    return {
      cacheStats: {},
      batchStats: {},
      rulesApplied: {},
    };
  }
}
