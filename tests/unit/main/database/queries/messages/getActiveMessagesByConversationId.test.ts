/**
 * Unit tests for getActiveMessagesByConversationId query function
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { getActiveMessagesByConversationId } from '../../../../../../src/main/database/queries/messages/getActiveMessagesByConversationId';
import type { DatabaseMessage } from '../../../../../../src/main/database/schema/DatabaseMessage';

// Mock dependencies
vi.mock('../../../../../../src/main/database/connection', () => ({
  getDatabase: vi.fn(),
}));

describe('getActiveMessagesByConversationId', () => {
  let mockDb: {
    prepare: ReturnType<typeof vi.fn>;
  };
  let mockStatement: {
    all: ReturnType<typeof vi.fn>;
  };

  const mockConversationId = uuidv4();
  const mockActiveMessages: DatabaseMessage[] = [
    {
      id: uuidv4(),
      conversation_id: mockConversationId,
      agent_id: uuidv4(),
      is_active: true,
      content: 'Active message 1',
      type: 'text',
      metadata: '{}',
      timestamp: Date.now(),
    },
    {
      id: uuidv4(),
      conversation_id: mockConversationId,
      agent_id: uuidv4(),
      is_active: true,
      content: 'Active message 2',
      type: 'text',
      metadata: '{}',
      timestamp: Date.now() - 1000,
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    mockStatement = {
      all: vi.fn(),
    };

    mockDb = {
      prepare: vi.fn(() => mockStatement),
    };

    const { getDatabase } = vi.mocked(
      await import('../../../../../../src/main/database/connection'),
    );
    getDatabase.mockReturnValue(mockDb as unknown as Database.Database);
  });

  it('should return active messages for a conversation', () => {
    mockStatement.all.mockReturnValue(mockActiveMessages);

    const result = getActiveMessagesByConversationId(mockConversationId);

    expect(result).toEqual(mockActiveMessages);
    expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM messages'));
    expect(mockDb.prepare).toHaveBeenCalledWith(
      expect.stringContaining('WHERE conversation_id = ? AND is_active = 1'),
    );
    expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('ORDER BY timestamp DESC'));
    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 100, 0);
  });

  it('should return empty array when no active messages exist', () => {
    mockStatement.all.mockReturnValue([]);

    const result = getActiveMessagesByConversationId(mockConversationId);

    expect(result).toEqual([]);
    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 100, 0);
  });

  it('should use default limit and offset when not provided', () => {
    mockStatement.all.mockReturnValue(mockActiveMessages);

    getActiveMessagesByConversationId(mockConversationId);

    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 100, 0);
  });

  it('should use custom limit and offset when provided', () => {
    mockStatement.all.mockReturnValue(mockActiveMessages);

    getActiveMessagesByConversationId(mockConversationId, 50, 10);

    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 50, 10);
  });

  it('should prepare SQL statement with correct query', () => {
    mockStatement.all.mockReturnValue(mockActiveMessages);

    getActiveMessagesByConversationId(mockConversationId);

    expect(mockDb.prepare).toHaveBeenCalledWith(
      expect.stringMatching(
        /SELECT \* FROM messages\s+WHERE conversation_id = \? AND is_active = 1\s+ORDER BY timestamp DESC\s+LIMIT \? OFFSET \?/,
      ),
    );
  });

  it('should filter only active messages (is_active = 1)', () => {
    mockStatement.all.mockReturnValue(mockActiveMessages);

    getActiveMessagesByConversationId(mockConversationId);

    const preparedQuery = mockDb.prepare.mock.calls[0][0];
    expect(preparedQuery).toContain('is_active = 1');
    expect(preparedQuery).not.toContain('is_active = 0');
  });

  it('should order results by timestamp DESC', () => {
    mockStatement.all.mockReturnValue(mockActiveMessages);

    getActiveMessagesByConversationId(mockConversationId);

    const preparedQuery = mockDb.prepare.mock.calls[0][0];
    expect(preparedQuery).toContain('ORDER BY timestamp DESC');
  });

  it('should handle database errors gracefully', () => {
    mockStatement.all.mockImplementation(() => {
      throw new Error('Database error');
    });

    expect(() => {
      getActiveMessagesByConversationId(mockConversationId);
    }).toThrow('Database error');
  });

  it('should return results in correct type format', () => {
    mockStatement.all.mockReturnValue(mockActiveMessages);

    const result = getActiveMessagesByConversationId(mockConversationId);

    expect(Array.isArray(result)).toBe(true);
    result.forEach(message => {
      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('conversation_id');
      expect(message).toHaveProperty('agent_id');
      expect(message).toHaveProperty('is_active');
      expect(message).toHaveProperty('content');
      expect(message).toHaveProperty('type');
      expect(message).toHaveProperty('metadata');
      expect(message).toHaveProperty('timestamp');
      expect(message.is_active).toBe(true);
    });
  });

  it('should handle large result sets with proper pagination', () => {
    const largeMessageSet = Array.from({ length: 200 }, (_, i) => ({
      id: uuidv4(),
      conversation_id: mockConversationId,
      agent_id: uuidv4(),
      is_active: true,
      content: `Message ${i}`,
      type: 'text',
      metadata: '{}',
      timestamp: Date.now() - i * 1000,
    }));

    mockStatement.all.mockReturnValue(largeMessageSet.slice(0, 100));

    const result = getActiveMessagesByConversationId(mockConversationId, 100, 0);

    expect(result).toHaveLength(100);
    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 100, 0);
  });

  it('should handle edge case with zero limit', () => {
    mockStatement.all.mockReturnValue([]);

    const result = getActiveMessagesByConversationId(mockConversationId, 0, 0);

    expect(result).toEqual([]);
    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 0, 0);
  });
});
