/**
 * Unit tests for database initialization
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeDatabase } from '../../../../../src/main/database/connection/initializeDatabase';
import { closeDatabase } from '../../../../../src/main/database/connection/closeDatabase';
import * as state from '../../../../../src/main/database/connection/state';
import { app } from 'electron';
import path from 'path';
import { enableWalMode } from '../../../../../src/main/database/checkpoint/enableWalMode';
import { configureAutoCheckpoint } from '../../../../../src/main/database/checkpoint/configureAutoCheckpoint';

// Mock dependencies
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/test/path'),
  },
}));

vi.mock('path', () => ({
  default: {
    join: vi.fn((...args) => args.join('/')),
  },
}));

const mockDatabase = {
  prepare: vi.fn(() => ({
    run: vi.fn().mockReturnValue({ changes: 1 }),
    get: vi.fn(),
    all: vi.fn(() => []),
  })),
  exec: vi.fn(),
  pragma: vi.fn(),
  close: vi.fn(),
};

vi.mock('better-sqlite3', () => ({
  default: vi.fn(() => mockDatabase),
}));

vi.mock('../../../../../src/main/database/checkpoint/enableWalMode', () => ({
  enableWalMode: vi.fn(),
}));

vi.mock('../../../../../src/main/database/checkpoint/configureAutoCheckpoint', () => ({
  configureAutoCheckpoint: vi.fn(),
}));

describe('initializeDatabase', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset database state
    const currentDb = state.databaseState.getInstance();
    if (currentDb) {
      currentDb.close();
    }
    state.databaseState.setInstance(null);

    // Get fresh mock database instance
    mockDb = new (Database as any)('/test/path/database.sqlite');
  });

  afterEach(() => {
    closeDatabase();
  });

  it('should create database with correct path', () => {
    const result = initializeDatabase();

    expect(app.getPath).toHaveBeenCalledWith('userData');
    expect(path.join).toHaveBeenCalledWith('/test/path', 'database.sqlite');
    expect(Database).toHaveBeenCalledWith('/test/path/database.sqlite');
    expect(result).toBe(mockDb);
  });

  it('should enable foreign keys', () => {
    initializeDatabase();

    expect(mockDb.pragma).toHaveBeenCalledWith('foreign_keys = ON');
  });

  it('should enable WAL mode and configure checkpoint', () => {
    initializeDatabase();

    expect(enableWalMode).toHaveBeenCalled();
    expect(configureAutoCheckpoint).toHaveBeenCalledWith(1000);
  });

  it('should store database instance in state', () => {
    const result = initializeDatabase();

    const storedDb = state.databaseState.getInstance();
    expect(storedDb).toBe(mockDb);
    expect(result).toBe(mockDb);
  });

  it('should not reinitialize if database already exists', () => {
    // First initialization
    const firstResult = initializeDatabase();

    // Clear mocks
    vi.clearAllMocks();

    // Second initialization attempt
    const secondResult = initializeDatabase();

    // Should return the same instance
    expect(secondResult).toBe(firstResult);
    expect(Database).not.toHaveBeenCalled();
  });

  it('should handle initialization errors', () => {
    const error = new Error('Database initialization failed');
    vi.mocked(Database).mockImplementationOnce(() => {
      throw error;
    });

    expect(() => initializeDatabase()).toThrow('Database initialization failed');
  });
});
