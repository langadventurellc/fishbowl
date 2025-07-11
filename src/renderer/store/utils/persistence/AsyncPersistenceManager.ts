/**
 * Manages async persistence operations with throttling and requestIdleCallback optimization
 */

import type { AsyncPersistenceConfig, PersistenceMetrics, PersistenceOperation } from './types';

export class AsyncPersistenceManager {
  private static instance: AsyncPersistenceManager;
  private config: Required<AsyncPersistenceConfig>;
  private operationQueue: PersistenceOperation[] = [];
  private isProcessing = false;
  private metrics: PersistenceMetrics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    totalExecutionTime: 0,
    averageExecutionTime: 0,
    minExecutionTime: Number.MAX_VALUE,
    maxExecutionTime: 0,
    throttledOperations: 0,
    idleCallbackOperations: 0,
    forcedOperations: 0,
    averageDataSize: 0,
    totalDataSize: 0,
    currentQueueSize: 0,
    maxQueueSize: 0,
    recentErrors: [],
    lastSuccessfulPersistence: 0,
    lastFailedPersistence: 0,
  };
  private lastPersistenceTimestamp = 0;
  private throttleTimer: number | null = null;
  private forceTimer: number | null = null;
  private idleCallbackId: number | null = null;

  private constructor(config: AsyncPersistenceConfig) {
    this.config = {
      throttleMs: 100,
      maxWaitMs: 1000,
      enablePerformanceMonitoring: true,
      storage: globalThis.localStorage,
      serialize: JSON.stringify,
      deserialize: JSON.parse,
      skipHydration: false,
      partialize: <T>(state: T) => state as Partial<T>,
      migrate: (persistedState: unknown, _version: number) => persistedState,
      onRehydrateStorage: () => (state: unknown, error?: Error) => {
        // Default no-op rehydration callback
        if (error) {
          console.warn('Rehydration error:', error);
        }
      },
      ...config,
    };
  }

  /**
   * Gets the singleton instance of the async persistence manager
   */
  static getInstance(config?: AsyncPersistenceConfig): AsyncPersistenceManager {
    if (!AsyncPersistenceManager.instance) {
      if (!config) {
        throw new Error('AsyncPersistenceManager requires config on first instantiation');
      }
      AsyncPersistenceManager.instance = new AsyncPersistenceManager(config);
    }
    return AsyncPersistenceManager.instance;
  }

  /**
   * Queues a persistence operation for async execution
   */
  async queuePersistence(
    state: unknown,
    options: {
      type?: PersistenceOperation['type'];
      immediate?: boolean;
      priority?: number;
      onComplete?: (error?: Error) => void;
      metadata?: Record<string, unknown>;
    } = {},
  ): Promise<void> {
    const operation: PersistenceOperation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      state: this.config.partialize ? this.config.partialize(state) : state,
      timestamp: Date.now(),
      type: options.type ?? 'update',
      immediate: options.immediate ?? false,
      priority: options.priority ?? 0,
      onComplete: options.onComplete,
      metadata: options.metadata,
    };

    // Add to queue
    this.operationQueue.push(operation);
    this.operationQueue.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    // Update metrics
    this.metrics.currentQueueSize = this.operationQueue.length;
    this.metrics.maxQueueSize = Math.max(this.metrics.maxQueueSize, this.metrics.currentQueueSize);

    // Handle immediate operations
    if (operation.immediate) {
      await this.processQueue();
      return;
    }

    // Schedule processing
    this.scheduleProcessing();
  }

  /**
   * Schedules queue processing using throttling and requestIdleCallback
   */
  private scheduleProcessing(): void {
    if (this.isProcessing) {
      return;
    }

    // Clear existing timers
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
    }
    if (this.forceTimer) {
      clearTimeout(this.forceTimer);
    }
    if (this.idleCallbackId) {
      cancelIdleCallback(this.idleCallbackId);
    }

    // Set up throttle timer
    this.throttleTimer = window.setTimeout(() => {
      if (this.operationQueue.length > 0) {
        // Try to use requestIdleCallback if available
        if (typeof requestIdleCallback === 'function') {
          this.idleCallbackId = requestIdleCallback(
            () => {
              void this.processQueue();
            },
            { timeout: this.config.maxWaitMs },
          );
        } else {
          // Fallback to setTimeout
          setTimeout(() => {
            void this.processQueue();
          }, 0);
        }
      }
    }, this.config.throttleMs);

    // Set up force timer to ensure persistence happens even if idle callback is delayed
    this.forceTimer = window.setTimeout(() => {
      if (this.operationQueue.length > 0 && !this.isProcessing) {
        this.metrics.forcedOperations++;
        void this.processQueue();
      }
    }, this.config.maxWaitMs);
  }

  /**
   * Processes the operation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.operationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // Clear timers
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    if (this.forceTimer) {
      clearTimeout(this.forceTimer);
      this.forceTimer = null;
    }
    if (this.idleCallbackId) {
      cancelIdleCallback(this.idleCallbackId);
      this.idleCallbackId = null;
    }

    try {
      // Process operations in batches for better performance
      const operations = this.operationQueue.splice(0);
      this.metrics.currentQueueSize = 0;

      if (operations.length === 0) {
        return;
      }

      // Use the most recent state for persistence
      const latestOperation = operations[operations.length - 1];
      const startTime = performance.now();

      // Track if we used idle callback
      const usedIdleCallback = this.idleCallbackId !== null;
      if (usedIdleCallback) {
        this.metrics.idleCallbackOperations++;
      }

      // If we have multiple operations, this is a batch
      if (operations.length > 1) {
        this.metrics.throttledOperations += operations.length - 1;
      }

      // Perform the actual persistence
      await this.persistState(latestOperation.state);

      const executionTime = performance.now() - startTime;
      this.updateMetrics(operations, executionTime, null);

      // Call completion callbacks
      operations.forEach(op => {
        if (op.onComplete) {
          try {
            op.onComplete();
          } catch (error) {
            console.warn('Error in persistence completion callback:', error);
          }
        }
      });

      this.lastPersistenceTimestamp = Date.now();
    } catch (error) {
      const executionTime = performance.now() - performance.now();
      this.updateMetrics([], executionTime, error as Error);

      // Call completion callbacks with error
      this.operationQueue.forEach(op => {
        if (op.onComplete) {
          try {
            op.onComplete(error as Error);
          } catch (callbackError) {
            console.warn('Error in persistence completion callback:', callbackError);
          }
        }
      });

      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Performs the actual state persistence
   */
  private async persistState(state: unknown): Promise<void> {
    try {
      const serializedState = this.config.serialize(state);
      const persistenceData = {
        state,
        version: this.config.version,
      };

      // Persist to storage asynchronously
      await new Promise<void>((resolve, reject) => {
        try {
          this.config.storage.setItem(this.config.name, this.config.serialize(persistenceData));
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });

      // Update metrics
      this.metrics.totalDataSize += serializedState.length;
      this.metrics.averageDataSize = this.metrics.totalDataSize / this.metrics.totalOperations;
      this.metrics.lastSuccessfulPersistence = Date.now();
    } catch (error) {
      this.metrics.lastFailedPersistence = Date.now();
      this.addError(error as Error);
      throw error;
    }
  }

  /**
   * Updates persistence metrics
   */
  private updateMetrics(
    operations: PersistenceOperation[],
    executionTime: number,
    error: Error | null,
  ): void {
    this.metrics.totalOperations += operations.length;

    if (error) {
      this.metrics.failedOperations += operations.length;
    } else {
      this.metrics.successfulOperations += operations.length;
    }

    this.metrics.totalExecutionTime += executionTime;
    this.metrics.averageExecutionTime =
      this.metrics.totalExecutionTime / this.metrics.totalOperations;
    this.metrics.minExecutionTime = Math.min(this.metrics.minExecutionTime, executionTime);
    this.metrics.maxExecutionTime = Math.max(this.metrics.maxExecutionTime, executionTime);

    // Log performance issues if monitoring is enabled
    if (this.config.enablePerformanceMonitoring) {
      if (executionTime > 5) {
        console.warn(
          `⚠️ Slow persistence operation: ${executionTime.toFixed(2)}ms for ${operations.length} operations`,
        );
      }
    }
  }

  /**
   * Adds an error to the metrics
   */
  private addError(error: Error): void {
    this.metrics.recentErrors.push({
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
    });

    // Keep only last 10 errors
    if (this.metrics.recentErrors.length > 10) {
      this.metrics.recentErrors.shift();
    }
  }

  /**
   * Hydrates state from storage
   */
  async hydrateState(): Promise<unknown> {
    if (this.config.skipHydration) {
      return null;
    }

    try {
      // Read from storage asynchronously
      const persistedData = await new Promise<string | null>((resolve, reject) => {
        try {
          const data = this.config.storage.getItem(this.config.name);
          resolve(data);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });

      if (!persistedData) {
        return null;
      }

      const parsed = this.config.deserialize(persistedData);
      const data = parsed as { state: unknown; version: number };

      // Handle version migration
      if (this.config.migrate && data.version !== this.config.version) {
        return this.config.migrate(data.state, data.version);
      }

      return data.state;
    } catch (error) {
      this.addError(error as Error);
      if (this.config.onRehydrateStorage) {
        const onRehydrate = this.config.onRehydrateStorage();
        if (onRehydrate) {
          onRehydrate(null, error as Error);
        }
      }
      throw error;
    }
  }

  /**
   * Forces immediate persistence of any queued operations
   */
  async flushQueue(): Promise<void> {
    if (this.operationQueue.length > 0) {
      await this.processQueue();
    }
  }

  /**
   * Gets current persistence metrics
   */
  getMetrics(): PersistenceMetrics {
    return { ...this.metrics };
  }

  /**
   * Resets all metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      minExecutionTime: Number.MAX_VALUE,
      maxExecutionTime: 0,
      throttledOperations: 0,
      idleCallbackOperations: 0,
      forcedOperations: 0,
      averageDataSize: 0,
      totalDataSize: 0,
      currentQueueSize: this.operationQueue.length,
      maxQueueSize: 0,
      recentErrors: [],
      lastSuccessfulPersistence: 0,
      lastFailedPersistence: 0,
    };
  }

  /**
   * Cleans up resources
   */
  cleanup(): void {
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
    }
    if (this.forceTimer) {
      clearTimeout(this.forceTimer);
    }
    if (this.idleCallbackId) {
      cancelIdleCallback(this.idleCallbackId);
    }
    this.operationQueue = [];
    this.isProcessing = false;
  }
}
