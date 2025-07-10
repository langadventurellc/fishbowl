/**
 * Unit tests for createConversation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { createConversation } from '../../../../../../src/main/database/queries/conversations/createConversation';
import type { DatabaseConversation } from '../../../../../../src/main/database/schema/DatabaseConversation';

// Mock dependencies
vi.mock('../../../../../../src/main/database/connection', () => ({
  getDatabase: vi.fn(),
}));

describe('createConversation', () => {
  let mockDb: {
    prepare: ReturnType<typeof vi.fn>;
  };
  let mockStatement: {
    run: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockStatement = {
      run: vi.fn(),
    };

    mockDb = {
      prepare: vi.fn(() => mockStatement),
    };

    const { getDatabase } = vi.mocked(
      await import('../../../../../../src/main/database/connection'),
    );
    getDatabase.mockReturnValue(mockDb as unknown as Database.Database);
  });

  it('should create conversation with all fields', () => {
    const conversation: Omit<DatabaseConversation, 'created_at' | 'updated_at'> = {
      id: 'custom-id',
      name: 'Test Conversation',
      description: 'Test description',
      is_active: true,
    };

    const result = createConversation(conversation);

    expect(mockDb.prepare).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO conversations'),
    );
    expect(mockStatement.run).toHaveBeenCalledWith(
      'custom-id',
      'Test Conversation',
      'Test description',
      true,
      expect.any(Number),
      expect.any(Number),
    );

    expect(result).toEqual({
      id: 'custom-id',
      name: 'Test Conversation',
      description: 'Test description',
      created_at: expect.any(Number),
      updated_at: expect.any(Number),
      is_active: true,
    });
  });

  it('should create conversation with required fields', () => {
    const conversation: Omit<DatabaseConversation, 'created_at' | 'updated_at'> = {
      id: 'test-id',
      name: 'Test Conversation',
      description: 'Test description',
      is_active: true,
    };

    const result = createConversation(conversation);

    expect(result.id).toBe('test-id');
    expect(result.name).toBe('Test Conversation');
    expect(result.description).toBe('Test description');
    expect(result.is_active).toBe(true);
    expect(result.created_at).toBe(result.updated_at);
  });

  it('should set timestamps correctly', () => {
    const conversation: Omit<DatabaseConversation, 'created_at' | 'updated_at'> = {
      id: 'test-id',
      name: 'Test Conversation',
      description: 'Test description',
      is_active: true,
    };

    const result = createConversation(conversation);

    expect(result.created_at).toBeGreaterThan(0);
    expect(result.updated_at).toBeGreaterThan(0);
    expect(result.created_at).toBe(result.updated_at);
  });

  it('should handle database errors', () => {
    mockStatement.run.mockImplementation(() => {
      throw new Error('Database error');
    });

    const conversation: Omit<DatabaseConversation, 'created_at' | 'updated_at'> = {
      id: 'test-id',
      name: 'Test Conversation',
      description: 'Test description',
      is_active: true,
    };

    expect(() => createConversation(conversation)).toThrow('Database error');
  });

  it('should pass boolean values correctly', () => {
    const conversation: Omit<DatabaseConversation, 'created_at' | 'updated_at'> = {
      id: 'test-id',
      name: 'Test Conversation',
      description: 'Test description',
      is_active: false,
    };

    createConversation(conversation);

    expect(mockStatement.run).toHaveBeenCalledWith(
      'test-id',
      'Test Conversation',
      'Test description',
      false,
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('should handle empty description', () => {
    const conversation: Omit<DatabaseConversation, 'created_at' | 'updated_at'> = {
      id: 'test-id',
      name: 'Test Conversation',
      description: '',
      is_active: true,
    };

    const result = createConversation(conversation);

    expect(result.description).toBe('');
    expect(mockStatement.run).toHaveBeenCalledWith(
      'test-id',
      'Test Conversation',
      '',
      true,
      expect.any(Number),
      expect.any(Number),
    );
  });

  it('should use same timestamp for created_at and updated_at', () => {
    const conversation: Omit<DatabaseConversation, 'created_at' | 'updated_at'> = {
      id: 'test-id',
      name: 'Test Conversation',
      description: 'Test description',
      is_active: true,
    };

    createConversation(conversation);

    const callArgs = mockStatement.run.mock.calls[0];
    expect(callArgs[4]).toBe(callArgs[5]); // created_at === updated_at
    expect(callArgs[4]).toBeGreaterThan(0);
  });
});
