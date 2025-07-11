/**
 * Persistence enhancer that provides non-blocking persistence with throttling
 * Works with existing Zustand persist middleware
 */

interface PersistenceEnhancerOptions {
  /**
   * Throttle delay in milliseconds
   * @default 150
   */
  throttleMs?: number;

  /**
   * Maximum wait time for requestIdleCallback
   * @default 1000
   */
  maxWaitMs?: number;

  /**
   * Enable performance monitoring
   * @default true
   */
  enablePerformanceMonitoring?: boolean;
}

interface PersistenceMetrics {
  totalOperations: number;
  throttledOperations: number;
  idleCallbackOperations: number;
  forcedOperations: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
}

/**
 * Enhances localStorage operations with throttling and non-blocking behavior
 */
export class PersistenceEnhancer {
  private static instance: PersistenceEnhancer;
  private options: Required<PersistenceEnhancerOptions>;
  private pendingOperations = new Map<string, { data: string; timestamp: number }>();
  private isProcessing = false;
  private throttleTimer: number | null = null;
  private forceTimer: number | null = null;
  private idleCallbackId: number | null = null;
  private metrics: PersistenceMetrics = {
    totalOperations: 0,
    throttledOperations: 0,
    idleCallbackOperations: 0,
    forcedOperations: 0,
    averageExecutionTime: 0,
    totalExecutionTime: 0,
  };

  private constructor(options: PersistenceEnhancerOptions = {}) {
    this.options = {
      throttleMs: 150,
      maxWaitMs: 1000,
      enablePerformanceMonitoring: true,
      ...options,
    };
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(options?: PersistenceEnhancerOptions): PersistenceEnhancer {
    if (!PersistenceEnhancer.instance) {
      PersistenceEnhancer.instance = new PersistenceEnhancer(options);
    }
    return PersistenceEnhancer.instance;
  }

  /**
   * Enhances a storage implementation with throttling and non-blocking behavior
   */
  enhanceStorage(storage: Storage): Storage {
    return {
      get length() {
        return storage.length;
      },
      key(index: number) {
        return storage.key(index);
      },
      getItem(key: string) {
        return storage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        this.queueWrite(key, value, storage);
      },
      removeItem: (key: string) => {
        this.queueRemove(key, storage);
      },
      clear: () => {
        this.queueClear(storage);
      },
    };
  }

  /**
   * Queues a write operation for throttled execution
   */
  private queueWrite(key: string, value: string, storage: Storage): void {
    this.pendingOperations.set(key, { data: value, timestamp: Date.now() });
    this.scheduleProcessing(storage);
  }

  /**
   * Queues a remove operation for throttled execution
   */
  private queueRemove(key: string, storage: Storage): void {
    this.pendingOperations.set(key, { data: '__REMOVE__', timestamp: Date.now() });
    this.scheduleProcessing(storage);
  }

  /**
   * Queues a clear operation for immediate execution
   */
  private queueClear(storage: Storage): void {
    this.pendingOperations.clear();
    this.pendingOperations.set('__CLEAR__', { data: '__CLEAR__', timestamp: Date.now() });
    this.scheduleProcessing(storage);
  }

  /**
   * Schedules processing of pending operations
   */
  private scheduleProcessing(storage: Storage): void {
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
      if (this.pendingOperations.size > 0) {
        // Try to use requestIdleCallback if available
        if (typeof requestIdleCallback === 'function') {
          this.idleCallbackId = requestIdleCallback(
            () => {
              this.processOperations(storage);
            },
            { timeout: this.options.maxWaitMs },
          );
        } else {
          // Fallback to setTimeout
          setTimeout(() => {
            this.processOperations(storage);
          }, 0);
        }
      }
    }, this.options.throttleMs);

    // Set up force timer to ensure operations are processed
    this.forceTimer = window.setTimeout(() => {
      if (this.pendingOperations.size > 0 && !this.isProcessing) {
        this.metrics.forcedOperations++;
        this.processOperations(storage);
      }
    }, this.options.maxWaitMs);
  }

  /**
   * Processes pending operations
   */
  private processOperations(storage: Storage): void {
    if (this.isProcessing || this.pendingOperations.size === 0) {
      return;
    }

    this.isProcessing = true;
    const startTime = performance.now();

    try {
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

      // Track if we used idle callback
      const usedIdleCallback = this.idleCallbackId !== null;
      if (usedIdleCallback) {
        this.metrics.idleCallbackOperations++;
      }

      // Process operations
      const operations = Array.from(this.pendingOperations.entries());
      this.pendingOperations.clear();

      // Handle clear operation first
      const clearOperation = operations.find(([key]) => key === '__CLEAR__');
      if (clearOperation) {
        storage.clear();
      } else {
        // Process write and remove operations
        for (const [key, operation] of operations) {
          if (operation.data === '__REMOVE__') {
            storage.removeItem(key);
          } else {
            storage.setItem(key, operation.data);
          }
        }
      }

      // Update metrics
      this.metrics.totalOperations += operations.length;
      if (operations.length > 1) {
        this.metrics.throttledOperations += operations.length - 1;
      }

      const executionTime = performance.now() - startTime;
      this.metrics.totalExecutionTime += executionTime;
      this.metrics.averageExecutionTime =
        this.metrics.totalExecutionTime / this.metrics.totalOperations;

      // Log performance issues if monitoring is enabled
      if (this.options.enablePerformanceMonitoring && executionTime > 5) {
        console.warn(
          `⚠️ Slow persistence operation: ${executionTime.toFixed(2)}ms for ${operations.length} operations`,
        );
      }
    } catch (error) {
      console.error('Persistence operation failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Forces immediate processing of all pending operations
   */
  flush(storage: Storage): void {
    if (this.pendingOperations.size > 0) {
      this.processOperations(storage);
    }
  }

  /**
   * Gets current metrics
   */
  getMetrics(): PersistenceMetrics {
    return { ...this.metrics };
  }

  /**
   * Resets metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalOperations: 0,
      throttledOperations: 0,
      idleCallbackOperations: 0,
      forcedOperations: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0,
    };
  }

  /**
   * Cleanup resources
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
    this.pendingOperations.clear();
    this.isProcessing = false;
  }
}
