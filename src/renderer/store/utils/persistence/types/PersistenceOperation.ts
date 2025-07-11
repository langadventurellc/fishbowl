/**
 * Represents a persistence operation that can be queued and executed
 */
export interface PersistenceOperation {
  /**
   * Unique identifier for the operation
   */
  id: string;

  /**
   * The state data to persist
   */
  state: unknown;

  /**
   * Timestamp when the operation was created
   */
  timestamp: number;

  /**
   * Priority level for the operation
   * Higher numbers = higher priority
   * @default 0
   */
  priority?: number;

  /**
   * Operation type for debugging and monitoring
   */
  type: 'update' | 'batch' | 'force';

  /**
   * Whether this operation should be executed immediately
   * @default false
   */
  immediate?: boolean;

  /**
   * Callback to execute when operation completes
   */
  onComplete?: (error?: Error) => void;

  /**
   * Additional metadata for the operation
   */
  metadata?: Record<string, unknown>;
}
