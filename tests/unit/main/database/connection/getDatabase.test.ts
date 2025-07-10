/**
 * Unit tests for getDatabase function
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type Database from 'better-sqlite3';
import { getDatabase } from '../../../../../src/main/database/connection/getDatabase';
import { closeDatabase } from '../../../../../src/main/database/connection/closeDatabase';
import * as state from '../../../../../src/main/database/connection/state';

describe('getDatabase', () => {
  const mockDatabase = {
    memory: false,
    readonly: false,
    name: 'test.db',
    open: true,
    inTransaction: false,
    prepare: vi.fn(),
    transaction: vi.fn(),
    exec: vi.fn(),
    pragma: vi.fn(),
    function: vi.fn(),
    aggregate: vi.fn(),
    loadExtension: vi.fn(),
    close: vi.fn(),
    defaultSafeIntegers: vi.fn(),
    backup: vi.fn(),
    table: vi.fn(),
    unsafeMode: vi.fn(),
    serialize: vi.fn(),
  } as unknown as Database.Database;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset database state
    state.databaseState.setInstance(null);
  });

  afterEach(() => {
    closeDatabase();
  });

  it('should return existing database instance if available', () => {
    // Set up existing database
    state.databaseState.setInstance(mockDatabase);

    const db = getDatabase();

    expect(db).toBe(mockDatabase);
  });

  it('should throw error if database is not initialized', () => {
    // Database is null by default
    expect(() => getDatabase()).toThrow(
      'Database not initialized. Call initializeDatabase() first.',
    );
  });
});
