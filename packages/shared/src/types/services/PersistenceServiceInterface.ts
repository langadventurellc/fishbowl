/**
 * @fileoverview Persistence Service Interface
 *
 * Service interface for data persistence operations with transaction support.
 */

/**
 * Persistence Service Interface
 * Handles data storage operations with atomic transactions
 */
export interface PersistenceService {
  /**
   * Save entity to storage with type safety
   */
  save<T>(entity: T, entityType: string): Promise<T>;

  /**
   * Find entity by ID with type safety
   */
  findById<T>(id: string, entityType: string): Promise<T | null>;

  /**
   * Update entity with optimistic locking
   */
  update<T>(id: string, updates: Partial<T>, entityType: string): Promise<T>;

  /**
   * Delete entity from storage
   */
  delete(id: string, entityType: string): Promise<void>;

  /**
   * Find all entities with optional filtering
   */
  findAll<T>(
    entityType: string,
    filters?: Record<string, unknown>,
  ): Promise<T[]>;

  /**
   * Check if entity exists
   */
  exists(id: string, entityType: string): Promise<boolean>;

  /**
   * Count entities matching criteria
   */
  count(entityType: string, filters?: Record<string, unknown>): Promise<number>;
}
