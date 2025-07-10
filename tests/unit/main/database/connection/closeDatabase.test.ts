/**
 * Unit tests for closeDatabase function
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { closeDatabase } from '../../../../../src/main/database/connection/closeDatabase';
import * as state from '../../../../../src/main/database/connection/state';

// Mock the state module
vi.mock('../../../../../src/main/database/connection/state', () => {
  let mockDb: any = null;
  return {
    databaseState: {
      getInstance: vi.fn(() => mockDb),
      setInstance: vi.fn((db: any) => {
        mockDb = db;
      }),
    },
  };
});

describe('closeDatabase', () => {
  const mockDatabase = {
    close: vi.fn(),
    prepare: vi.fn(),
    exec: vi.fn(),
  } as unknown as Database.Database;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should close existing database connection', () => {
    // Set up existing database
    state.databaseState.setInstance(mockDatabase);

    closeDatabase();

    expect(mockDatabase.close).toHaveBeenCalled();
    expect(state.databaseState.setInstance).toHaveBeenCalledWith(null);
  });

  it('should handle case when no database exists', () => {
    // No database set
    state.databaseState.setInstance(null);

    // Should not throw
    expect(() => closeDatabase()).not.toThrow();
    expect(mockDatabase.close).not.toHaveBeenCalled();
  });

  it('should propagate close errors', () => {
    const error = new Error('Close failed');
    const errorDb = {
      close: vi.fn(() => {
        throw error;
      }),
    } as unknown as Database.Database;

    state.databaseState.setInstance(errorDb);

    // Should throw the error
    expect(() => closeDatabase()).toThrow('Close failed');
  });
});
