/**
 * Metrics tracking for persistence operations
 */
export interface PersistenceMetrics {
  /**
   * Total number of persistence operations
   */
  totalOperations: number;

  /**
   * Number of successful operations
   */
  successfulOperations: number;

  /**
   * Number of failed operations
   */
  failedOperations: number;

  /**
   * Total time spent on persistence operations (ms)
   */
  totalExecutionTime: number;

  /**
   * Average execution time per operation (ms)
   */
  averageExecutionTime: number;

  /**
   * Minimum execution time recorded (ms)
   */
  minExecutionTime: number;

  /**
   * Maximum execution time recorded (ms)
   */
  maxExecutionTime: number;

  /**
   * Number of operations that were throttled/batched
   */
  throttledOperations: number;

  /**
   * Number of operations that used requestIdleCallback
   */
  idleCallbackOperations: number;

  /**
   * Number of operations that were forced due to timeout
   */
  forcedOperations: number;

  /**
   * Average data size persisted (bytes)
   */
  averageDataSize: number;

  /**
   * Total data size persisted (bytes)
   */
  totalDataSize: number;

  /**
   * Current queue size
   */
  currentQueueSize: number;

  /**
   * Maximum queue size reached
   */
  maxQueueSize: number;

  /**
   * Recent error messages
   */
  recentErrors: Array<{
    timestamp: number;
    message: string;
    stack?: string;
  }>;

  /**
   * Timestamp of last successful persistence
   */
  lastSuccessfulPersistence: number;

  /**
   * Timestamp of last failed persistence
   */
  lastFailedPersistence: number;
}
