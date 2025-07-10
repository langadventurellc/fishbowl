/**
 * Unit tests for runMigrations function
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runMigrations } from '../../../../../src/main/database/migrations-system/runMigrations';
import { Migration } from '../../../../../src/main/database/migrations-system/Migration';

// Mock dependencies
vi.mock('../../../../../src/main/database/connection', () => ({
  getDatabase: vi.fn(),
}));

vi.mock('../../../../../src/main/database/migrations-system/getCurrentVersion', () => ({
  getCurrentVersion: vi.fn(() => 0),
}));

vi.mock('../../../../../src/main/database/migrations-system/setVersion', () => ({
  setVersion: vi.fn(),
}));

vi.mock('../../../../../src/main/database/migrations-system/loadMigrations', () => ({
  loadMigrations: vi.fn(() => []),
}));

describe('runMigrations', () => {
  let mockDb: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDb = {
      prepare: vi.fn(() => ({
        run: vi.fn(),
        get: vi.fn(),
      })),
      exec: vi.fn(),
      transaction: vi.fn((fn: () => void) => () => fn()),
    };

    // Mock getDatabase to return our mock database
    const { getDatabase } = vi.mocked(await import('../../../../../src/main/database/connection'));
    (getDatabase as any).mockReturnValue(mockDb);
  });

  it('should skip migrations if database is up to date', async () => {
    const { getCurrentVersion } = await import(
      '../../../../../src/main/database/migrations-system/getCurrentVersion'
    );
    const { loadMigrations } = await import(
      '../../../../../src/main/database/migrations-system/loadMigrations'
    );

    const migrations: Migration[] = [
      { version: 1, filename: '001-initial.sql', sql: 'CREATE TABLE test1;' },
      { version: 2, filename: '002-indexes.sql', sql: 'CREATE INDEX idx1;' },
    ];

    vi.mocked(getCurrentVersion).mockReturnValue(2);
    vi.mocked(loadMigrations).mockReturnValue(migrations);

    runMigrations();

    expect(mockDb.exec).not.toHaveBeenCalled();
  });

  it('should run pending migrations in order', async () => {
    const { getCurrentVersion } = await import(
      '../../../../../src/main/database/migrations-system/getCurrentVersion'
    );
    const { loadMigrations } = await import(
      '../../../../../src/main/database/migrations-system/loadMigrations'
    );
    const { setVersion } = await import(
      '../../../../../src/main/database/migrations-system/setVersion'
    );

    const migrations: Migration[] = [
      { version: 1, filename: '001-initial.sql', sql: 'CREATE TABLE test1;' },
      { version: 2, filename: '002-indexes.sql', sql: 'CREATE INDEX idx1;' },
      { version: 3, filename: '003-data.sql', sql: 'INSERT INTO test1;' },
    ];

    vi.mocked(getCurrentVersion).mockReturnValue(1);
    vi.mocked(loadMigrations).mockReturnValue(migrations);

    runMigrations();

    // Should run migrations 2 and 3
    expect(mockDb.exec).toHaveBeenCalledTimes(2);
    expect(mockDb.exec).toHaveBeenNthCalledWith(1, 'CREATE INDEX idx1;');
    expect(mockDb.exec).toHaveBeenNthCalledWith(2, 'INSERT INTO test1;');

    // Should update version after each migration
    expect(setVersion).toHaveBeenCalledTimes(2);
    expect(setVersion).toHaveBeenNthCalledWith(1, 2);
    expect(setVersion).toHaveBeenNthCalledWith(2, 3);
  });

  it('should handle migration errors', async () => {
    const { getCurrentVersion } = await import(
      '../../../../../src/main/database/migrations-system/getCurrentVersion'
    );
    const { loadMigrations } = await import(
      '../../../../../src/main/database/migrations-system/loadMigrations'
    );

    const migrations: Migration[] = [
      { version: 1, filename: '001-initial.sql', sql: 'CREATE TABLE test1;' },
      { version: 2, filename: '002-bad.sql', sql: 'INVALID SQL;' },
    ];

    vi.mocked(getCurrentVersion).mockReturnValue(0);
    vi.mocked(loadMigrations).mockReturnValue(migrations);

    // First migration succeeds, second fails
    const mockExec = mockDb.exec;
    mockExec
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error('SQL error');
      });

    expect(() => runMigrations()).toThrow('SQL error');
  });

  it('should handle empty migrations', async () => {
    const { getCurrentVersion } = await import(
      '../../../../../src/main/database/migrations-system/getCurrentVersion'
    );
    const { loadMigrations } = await import(
      '../../../../../src/main/database/migrations-system/loadMigrations'
    );

    vi.mocked(getCurrentVersion).mockReturnValue(0);
    vi.mocked(loadMigrations).mockReturnValue([]);

    runMigrations();

    expect(mockDb.exec).not.toHaveBeenCalled();
  });

  it('should validate migration sequence', async () => {
    const { getCurrentVersion } = await import(
      '../../../../../src/main/database/migrations-system/getCurrentVersion'
    );
    const { loadMigrations } = await import(
      '../../../../../src/main/database/migrations-system/loadMigrations'
    );

    const migrations: Migration[] = [
      { version: 1, filename: '001-initial.sql', sql: 'CREATE TABLE test1;' },
      { version: 3, filename: '003-gap.sql', sql: 'CREATE TABLE test3;' }, // Gap in sequence
    ];

    vi.mocked(getCurrentVersion).mockReturnValue(0);
    vi.mocked(loadMigrations).mockReturnValue(migrations);

    expect(() => runMigrations()).toThrow(/migration sequence/i);
  });

  it('should wrap migrations in transaction', async () => {
    const { getCurrentVersion } = await import(
      '../../../../../src/main/database/migrations-system/getCurrentVersion'
    );
    const { loadMigrations } = await import(
      '../../../../../src/main/database/migrations-system/loadMigrations'
    );

    const migrations: Migration[] = [
      { version: 1, filename: '001-initial.sql', sql: 'CREATE TABLE test1;' },
    ];

    vi.mocked(getCurrentVersion).mockReturnValue(0);
    vi.mocked(loadMigrations).mockReturnValue(migrations);

    let transactionCalled = false;
    mockDb.transaction = vi.fn(fn => {
      transactionCalled = true;
      return () => fn();
    });

    runMigrations();

    expect(transactionCalled).toBe(true);
  });
});
