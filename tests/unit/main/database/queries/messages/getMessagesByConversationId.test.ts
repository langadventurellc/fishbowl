/**
 * Unit tests for getMessagesByConversationId query function
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { getMessagesByConversationId } from '../../../../../../src/main/database/queries/messages/getMessagesByConversationId';
import type { DatabaseMessage } from '../../../../../../src/main/database/schema/DatabaseMessage';

// Mock dependencies
vi.mock('../../../../../../src/main/database/connection', () => ({
  getDatabase: vi.fn(),
}));

describe('getMessagesByConversationId', () => {
  let mockDb: {
    prepare: ReturnType<typeof vi.fn>;
  };
  let mockStatement: {
    all: ReturnType<typeof vi.fn>;
  };

  const mockConversationId = uuidv4();
  const mockMessages: DatabaseMessage[] = [
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
      is_active: false,
      content: 'Inactive message 2',
      type: 'text',
      metadata: '{}',
      timestamp: Date.now() - 1000,
    },
    {
      id: uuidv4(),
      conversation_id: mockConversationId,
      agent_id: uuidv4(),
      is_active: true,
      content: 'Active message 3',
      type: 'text',
      metadata: '{}',
      timestamp: Date.now() - 2000,
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

  it('should return all messages for a conversation (both active and inactive)', () => {
    mockStatement.all.mockReturnValue(mockMessages);

    const result = getMessagesByConversationId(mockConversationId);

    expect(result).toEqual(mockMessages);
    expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM messages'));
    expect(mockDb.prepare).toHaveBeenCalledWith(
      expect.stringContaining('WHERE conversation_id = ?'),
    );
    expect(mockDb.prepare).toHaveBeenCalledWith(expect.stringContaining('ORDER BY timestamp DESC'));
    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 100, 0);
  });

  it('should return empty array when no messages exist', () => {
    mockStatement.all.mockReturnValue([]);

    const result = getMessagesByConversationId(mockConversationId);

    expect(result).toEqual([]);
    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 100, 0);
  });

  it('should use default limit and offset when not provided', () => {
    mockStatement.all.mockReturnValue(mockMessages);

    getMessagesByConversationId(mockConversationId);

    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 100, 0);
  });

  it('should use custom limit and offset when provided', () => {
    mockStatement.all.mockReturnValue(mockMessages);

    getMessagesByConversationId(mockConversationId, 50, 10);

    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 50, 10);
  });

  it('should prepare SQL statement with correct query', () => {
    mockStatement.all.mockReturnValue(mockMessages);

    getMessagesByConversationId(mockConversationId);

    expect(mockDb.prepare).toHaveBeenCalledWith(
      expect.stringMatching(
        /SELECT \* FROM messages\s+WHERE conversation_id = \?\s+ORDER BY timestamp DESC\s+LIMIT \? OFFSET \?/,
      ),
    );
  });

  it('should NOT filter by is_active (returns all messages)', () => {
    mockStatement.all.mockReturnValue(mockMessages);

    getMessagesByConversationId(mockConversationId);

    const preparedQuery = mockDb.prepare.mock.calls[0][0];
    expect(preparedQuery).not.toContain('is_active');
    expect(preparedQuery).toContain('WHERE conversation_id = ?');
    expect(preparedQuery).not.toContain('AND is_active');
  });

  it('should order results by timestamp DESC', () => {
    mockStatement.all.mockReturnValue(mockMessages);

    getMessagesByConversationId(mockConversationId);

    const preparedQuery = mockDb.prepare.mock.calls[0][0];
    expect(preparedQuery).toContain('ORDER BY timestamp DESC');
  });

  it('should handle database errors gracefully', () => {
    mockStatement.all.mockImplementation(() => {
      throw new Error('Database error');
    });

    expect(() => {
      getMessagesByConversationId(mockConversationId);
    }).toThrow('Database error');
  });

  it('should return results in correct type format', () => {
    mockStatement.all.mockReturnValue(mockMessages);

    const result = getMessagesByConversationId(mockConversationId);

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
      expect(typeof message.is_active).toBe('boolean');
    });
  });

  it('should handle large result sets with proper pagination', () => {
    const largeMessageSet = Array.from({ length: 200 }, (_, i) => ({
      id: uuidv4(),
      conversation_id: mockConversationId,
      agent_id: uuidv4(),
      is_active: i % 2 === 0, // Mix of active and inactive
      content: `Message ${i}`,
      type: 'text',
      metadata: '{}',
      timestamp: Date.now() - i * 1000,
    }));

    mockStatement.all.mockReturnValue(largeMessageSet.slice(0, 100));

    const result = getMessagesByConversationId(mockConversationId, 100, 0);

    expect(result).toHaveLength(100);
    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 100, 0);
  });

  it('should handle edge case with zero limit', () => {
    mockStatement.all.mockReturnValue([]);

    const result = getMessagesByConversationId(mockConversationId, 0, 0);

    expect(result).toEqual([]);
    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 0, 0);
  });

  it('should handle pagination with high offset', () => {
    const paginatedMessages = [mockMessages[2]]; // Last message
    mockStatement.all.mockReturnValue(paginatedMessages);

    const result = getMessagesByConversationId(mockConversationId, 10, 50);

    expect(result).toEqual(paginatedMessages);
    expect(mockStatement.all).toHaveBeenCalledWith(mockConversationId, 10, 50);
  });

  it('should return both active and inactive messages in mixed results', () => {
    const mixedMessages = [
      { ...mockMessages[0], is_active: true },
      { ...mockMessages[1], is_active: false },
      { ...mockMessages[2], is_active: true },
    ];
    mockStatement.all.mockReturnValue(mixedMessages);

    const result = getMessagesByConversationId(mockConversationId);

    expect(result).toHaveLength(3);
    expect(result[0].is_active).toBe(true);
    expect(result[1].is_active).toBe(false);
    expect(result[2].is_active).toBe(true);
  });

  it('should handle different conversation IDs correctly', () => {
    const differentConversationId = uuidv4();
    mockStatement.all.mockReturnValue([]);

    getMessagesByConversationId(differentConversationId);

    expect(mockStatement.all).toHaveBeenCalledWith(differentConversationId, 100, 0);
  });
});
