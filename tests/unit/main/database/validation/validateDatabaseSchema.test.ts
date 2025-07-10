/**
 * Unit tests for database schema validation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateDatabaseSchema } from '../../../../../src/main/database/validation/validateDatabaseSchema';
import { DatabaseIntegrityError } from '../../../../../src/main/database/validation/DatabaseIntegrityError';

// Mock the getDatabase function
vi.mock('../../../../../src/main/database/connection', () => ({
  getDatabase: vi.fn(),
}));

describe('validateDatabaseSchema', () => {
  let mockDb: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate complete schema successfully', async () => {
    // Create fresh mock for this test
    mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => []),
        get: vi.fn(),
      })),
      pragma: vi.fn(),
    };

    // Mock getDatabase to return our mock database
    const { getDatabase } = vi.mocked(await import('../../../../../src/main/database/connection'));
    (getDatabase as any).mockReturnValue(mockDb);

    // Mock all required tables existing
    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('sqlite_master')) {
        return {
          get: vi.fn((table: string) => {
            const tables = ['conversations', 'agents', 'messages', 'conversation_agents'];
            return tables.includes(table) ? { name: table } : undefined;
          }),
        };
      }

      // Mock column info for each table
      if (query.includes('PRAGMA table_info')) {
        if (query.includes('(conversations)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'name' },
              { name: 'description' },
              { name: 'created_at' },
              { name: 'updated_at' },
              { name: 'is_active' },
            ]),
          };
        }
        if (query.includes('(agents)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'name' },
              { name: 'role' },
              { name: 'personality' },
              { name: 'is_active' },
              { name: 'created_at' },
              { name: 'updated_at' },
            ]),
          };
        }
        if (query.includes('(messages)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'conversation_id' },
              { name: 'agent_id' },
              { name: 'content' },
              { name: 'type' },
              { name: 'metadata' },
              { name: 'timestamp' },
            ]),
          };
        }
        if (query.includes('(conversation_agents)')) {
          return {
            all: vi.fn(() => [{ name: 'conversation_id' }, { name: 'agent_id' }]),
          };
        }
      }

      return { all: vi.fn(() => []), get: vi.fn() };
    });

    expect(() => validateDatabaseSchema()).not.toThrow();
  });

  it('should throw error for missing tables', async () => {
    // Create fresh mock for this test
    mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => []),
        get: vi.fn(),
      })),
      pragma: vi.fn(),
    };

    // Mock getDatabase to return our mock database
    const { getDatabase } = vi.mocked(await import('../../../../../src/main/database/connection'));
    (getDatabase as any).mockReturnValue(mockDb);

    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('sqlite_master')) {
        return {
          get: vi.fn((table: string) => {
            const existingTables = ['conversations', 'agents'];
            return existingTables.includes(table) ? { name: table } : undefined;
          }),
        };
      }
      return { all: vi.fn(() => []), get: vi.fn() };
    });

    expect(() => validateDatabaseSchema()).toThrow(DatabaseIntegrityError);
    expect(() => validateDatabaseSchema()).toThrow(/Required table 'messages' does not exist/);
  });

  it('should throw error for missing columns', async () => {
    // Create fresh mock for this test
    mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => []),
        get: vi.fn(),
      })),
      pragma: vi.fn(),
    };

    // Mock getDatabase to return our mock database
    const { getDatabase } = vi.mocked(await import('../../../../../src/main/database/connection'));
    (getDatabase as any).mockReturnValue(mockDb);

    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('sqlite_master')) {
        return {
          get: vi.fn((table: string) => {
            const tables = ['conversations', 'agents', 'messages', 'conversation_agents'];
            return tables.includes(table) ? { name: table } : undefined;
          }),
        };
      }

      if (query.includes('PRAGMA table_info') && query.includes('(conversations)')) {
        return {
          all: vi.fn(() => [
            { name: 'id' },
            { name: 'name' },
            // Missing other required columns
          ]),
        };
      }

      return { all: vi.fn(() => []), get: vi.fn() };
    });

    expect(() => validateDatabaseSchema()).toThrow(DatabaseIntegrityError);
    expect(() => validateDatabaseSchema()).toThrow(/Required column 'description' does not exist/);
  });

  it('should throw error for missing columns in agents table', async () => {
    // Create fresh mock for this test
    mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => []),
        get: vi.fn(),
      })),
      pragma: vi.fn(),
    };

    // Mock getDatabase to return our mock database
    const { getDatabase } = vi.mocked(await import('../../../../../src/main/database/connection'));
    (getDatabase as any).mockReturnValue(mockDb);

    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('sqlite_master')) {
        return {
          get: vi.fn((table: string) => {
            const tables = ['conversations', 'agents', 'messages', 'conversation_agents'];
            return tables.includes(table) ? { name: table } : undefined;
          }),
        };
      }

      if (query.includes('PRAGMA table_info')) {
        if (query.includes('(conversations)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'name' },
              { name: 'description' },
              { name: 'created_at' },
              { name: 'updated_at' },
              { name: 'is_active' },
            ]),
          };
        }
        if (query.includes('(agents)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'name' },
              // Missing other required columns
            ]),
          };
        }
      }

      return { all: vi.fn(() => []), get: vi.fn() };
    });

    expect(() => validateDatabaseSchema()).toThrow(DatabaseIntegrityError);
    expect(() => validateDatabaseSchema()).toThrow(/Required column 'role' does not exist/);
  });

  it('should throw error for missing columns in messages table', async () => {
    // Create fresh mock for this test
    mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => []),
        get: vi.fn(),
      })),
      pragma: vi.fn(),
    };

    // Mock getDatabase to return our mock database
    const { getDatabase } = vi.mocked(await import('../../../../../src/main/database/connection'));
    (getDatabase as any).mockReturnValue(mockDb);

    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('sqlite_master')) {
        return {
          get: vi.fn((table: string) => {
            const tables = ['conversations', 'agents', 'messages', 'conversation_agents'];
            return tables.includes(table) ? { name: table } : undefined;
          }),
        };
      }

      if (query.includes('PRAGMA table_info')) {
        if (query.includes('(conversations)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'name' },
              { name: 'description' },
              { name: 'created_at' },
              { name: 'updated_at' },
              { name: 'is_active' },
            ]),
          };
        }
        if (query.includes('(agents)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'name' },
              { name: 'role' },
              { name: 'personality' },
              { name: 'is_active' },
              { name: 'created_at' },
              { name: 'updated_at' },
            ]),
          };
        }
        if (query.includes('(messages)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'conversation_id' },
              // Missing other required columns
            ]),
          };
        }
      }

      return { all: vi.fn(() => []), get: vi.fn() };
    });

    expect(() => validateDatabaseSchema()).toThrow(DatabaseIntegrityError);
    expect(() => validateDatabaseSchema()).toThrow(/Required column 'agent_id' does not exist/);
  });

  it('should throw error for missing columns in conversation_agents table', async () => {
    // Create fresh mock for this test
    mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => []),
        get: vi.fn(),
      })),
      pragma: vi.fn(),
    };

    // Mock getDatabase to return our mock database
    const { getDatabase } = vi.mocked(await import('../../../../../src/main/database/connection'));
    (getDatabase as any).mockReturnValue(mockDb);

    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('sqlite_master')) {
        return {
          get: vi.fn((table: string) => {
            const tables = ['conversations', 'agents', 'messages', 'conversation_agents'];
            return tables.includes(table) ? { name: table } : undefined;
          }),
        };
      }

      if (query.includes('PRAGMA table_info')) {
        if (query.includes('(conversations)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'name' },
              { name: 'description' },
              { name: 'created_at' },
              { name: 'updated_at' },
              { name: 'is_active' },
            ]),
          };
        }
        if (query.includes('(agents)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'name' },
              { name: 'role' },
              { name: 'personality' },
              { name: 'is_active' },
              { name: 'created_at' },
              { name: 'updated_at' },
            ]),
          };
        }
        if (query.includes('(messages)')) {
          return {
            all: vi.fn(() => [
              { name: 'id' },
              { name: 'conversation_id' },
              { name: 'agent_id' },
              { name: 'content' },
              { name: 'type' },
              { name: 'metadata' },
              { name: 'timestamp' },
            ]),
          };
        }
        if (query.includes('(conversation_agents)')) {
          return {
            all: vi.fn(() => [
              { name: 'conversation_id' },
              // Missing agent_id column
            ]),
          };
        }
      }

      return { all: vi.fn(() => []), get: vi.fn() };
    });

    expect(() => validateDatabaseSchema()).toThrow(DatabaseIntegrityError);
    expect(() => validateDatabaseSchema()).toThrow(/Required column 'agent_id' does not exist/);
  });
});
