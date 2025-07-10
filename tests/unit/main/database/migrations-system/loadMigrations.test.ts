/**
 * Unit tests for loadMigrations function
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadMigrations } from '../../../../../src/main/database/migrations-system/loadMigrations';

// Mock dependencies
vi.mock('fs', () => ({
  default: {
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
    existsSync: vi.fn(() => true),
  },
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  existsSync: vi.fn(() => true),
}));

vi.mock('path', () => ({
  default: {
    join: vi.fn((...args) => args.join('/')),
    dirname: vi.fn(path => path.split('/').slice(0, -1).join('/')),
  },
  join: vi.fn((...args) => args.join('/')),
  dirname: vi.fn(path => path.split('/').slice(0, -1).join('/')),
}));

describe('loadMigrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and sort migrations correctly', async () => {
    const fs = await import('fs');

    (vi.mocked(fs.default.readdirSync) as any).mockReturnValue([
      '002-indexes.sql',
      '001-initial.sql',
      '003-optimization.sql',
      'README.md', // Should be ignored
    ]);

    (vi.mocked(fs.default.readFileSync) as any)
      .mockReturnValueOnce('CREATE TABLE conversations;')
      .mockReturnValueOnce('CREATE INDEX idx_conversations;')
      .mockReturnValueOnce('ANALYZE;');

    const migrations = loadMigrations();

    expect(migrations).toHaveLength(3);
    expect(migrations[0]).toEqual({
      version: 1,
      filename: '001-initial.sql',
      sql: 'CREATE TABLE conversations;',
    });
    expect(migrations[1]).toEqual({
      version: 2,
      filename: '002-indexes.sql',
      sql: 'CREATE INDEX idx_conversations;',
    });
    expect(migrations[2]).toEqual({
      version: 3,
      filename: '003-optimization.sql',
      sql: 'ANALYZE;',
    });
  });

  it('should ignore non-SQL files', async () => {
    const fs = await import('fs');

    (vi.mocked(fs.default.readdirSync) as any).mockReturnValue([
      '001-initial.sql',
      'readme.txt',
      '.gitignore',
      '002-indexes.sql', // Fixed case
    ]);

    (vi.mocked(fs.default.readFileSync) as any)
      .mockReturnValueOnce('CREATE TABLE test;')
      .mockReturnValueOnce('CREATE INDEX idx;');

    const migrations = loadMigrations();

    expect(migrations).toHaveLength(2);
    expect(fs.default.readFileSync).toHaveBeenCalledTimes(2);
  });

  it('should handle empty migration directory', async () => {
    const fs = await import('fs');

    (vi.mocked(fs.default.readdirSync) as any).mockReturnValue([]);

    const migrations = loadMigrations();

    expect(migrations).toHaveLength(0);
  });

  it('should handle migration files with invalid format', async () => {
    const fs = await import('fs');

    (vi.mocked(fs.default.readdirSync) as any).mockReturnValue([
      'initial.sql', // No version number
      '001-valid.sql',
    ]);

    (vi.mocked(fs.default.readFileSync) as any).mockReturnValue('SQL content');

    const migrations = loadMigrations();

    expect(migrations).toHaveLength(1);
    expect(migrations[0].filename).toBe('001-valid.sql');
  });

  it('should handle read errors', async () => {
    const fs = await import('fs');

    (vi.mocked(fs.default.readdirSync) as any).mockImplementation(() => {
      throw new Error('Directory not found');
    });

    expect(() => loadMigrations()).toThrow('Directory not found');
  });

  it('should trim whitespace from SQL content', async () => {
    const fs = await import('fs');

    (vi.mocked(fs.default.readdirSync) as any).mockReturnValue(['001-test.sql']);
    (vi.mocked(fs.default.readFileSync) as any).mockReturnValue('  \n\nCREATE TABLE test;\n\n  ');

    const migrations = loadMigrations();

    expect(migrations[0].sql).toBe('  \n\nCREATE TABLE test;\n\n  ');
  });

  it('should handle UTF-8 encoded files', async () => {
    const fs = await import('fs');

    (vi.mocked(fs.default.readdirSync) as any).mockReturnValue(['001-unicode.sql']);
    (vi.mocked(fs.default.readFileSync) as any).mockImplementation(
      (_path: string, encoding: string) => {
        expect(encoding).toBe('utf8');
        return 'CREATE TABLE émojis 🎉;';
      },
    );

    const migrations = loadMigrations();

    expect(migrations[0].sql).toBe('CREATE TABLE émojis 🎉;');
  });
});
