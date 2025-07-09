/**
 * Tests for database validation schemas
 */
import { describe, it, expect } from 'vitest';
import {
  UuidSchema,
  UuidArraySchema,
  SanitizedContentSchema,
  SanitizedNameSchema,
  SanitizedCreateAgentSchema,
  SanitizedUpdateAgentSchema,
  SanitizedCreateConversationSchema,
  SanitizedCreateMessageSchema,
  DatabaseFilterSchema,
  TransactionCreateConversationWithAgentsSchema,
  TransactionDeleteConversationCascadeSchema,
  TransactionTransferMessagesSchema,
} from '../../../../src/shared/types/validation/database-schema';
import { v4 as uuidv4 } from 'uuid';

describe('Database Validation Schemas', () => {
  describe('UuidSchema', () => {
    it('should validate valid UUIDs', () => {
      const validUuid = uuidv4();
      expect(() => UuidSchema.parse(validUuid)).not.toThrow();
    });

    it('should reject invalid UUIDs', () => {
      expect(() => UuidSchema.parse('invalid-uuid')).toThrow();
      expect(() => UuidSchema.parse('123')).toThrow();
      expect(() => UuidSchema.parse('')).toThrow();
    });
  });

  describe('UuidArraySchema', () => {
    it('should validate array of valid UUIDs', () => {
      const validUuids = [uuidv4(), uuidv4(), uuidv4()];
      expect(() => UuidArraySchema.parse(validUuids)).not.toThrow();
    });

    it('should reject empty arrays', () => {
      expect(() => UuidArraySchema.parse([])).toThrow();
    });

    it('should reject arrays with invalid UUIDs', () => {
      const invalidUuids = [uuidv4(), 'invalid-uuid', uuidv4()];
      expect(() => UuidArraySchema.parse(invalidUuids)).toThrow();
    });
  });

  describe('SanitizedContentSchema', () => {
    it('should trim content and validate', () => {
      const result = SanitizedContentSchema.parse('  Hello World  ');
      expect(result).toBe('Hello World');
    });

    it('should reject empty content', () => {
      expect(() => SanitizedContentSchema.parse('')).toThrow();
      expect(() => SanitizedContentSchema.parse('   ')).toThrow();
    });

    it('should reject content that is too long', () => {
      const longContent = 'a'.repeat(10001);
      expect(() => SanitizedContentSchema.parse(longContent)).toThrow();
    });

    it('should accept content within limits', () => {
      const validContent = 'a'.repeat(5000);
      expect(() => SanitizedContentSchema.parse(validContent)).not.toThrow();
    });
  });

  describe('SanitizedNameSchema', () => {
    it('should trim names and validate', () => {
      const result = SanitizedNameSchema.parse('  Test Name  ');
      expect(result).toBe('Test Name');
    });

    it('should reject empty names', () => {
      expect(() => SanitizedNameSchema.parse('')).toThrow();
      expect(() => SanitizedNameSchema.parse('   ')).toThrow();
    });

    it('should reject names with newlines', () => {
      expect(() => SanitizedNameSchema.parse('Test\nName')).toThrow();
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(256);
      expect(() => SanitizedNameSchema.parse(longName)).toThrow();
    });

    it('should accept valid names', () => {
      expect(() => SanitizedNameSchema.parse('Valid Name')).not.toThrow();
    });
  });

  describe('SanitizedCreateAgentSchema', () => {
    it('should validate and sanitize agent data', () => {
      const agentData = {
        name: '  Test Agent  ',
        role: 'Assistant',
        personality: 'Helpful and friendly',
        isActive: true,
      };

      const result = SanitizedCreateAgentSchema.parse(agentData);
      expect(result.name).toBe('Test Agent');
      expect(result.role).toBe('Assistant');
      expect(result.personality).toBe('Helpful and friendly');
      expect(result.isActive).toBe(true);
    });

    it('should use default value for isActive', () => {
      const agentData = {
        name: 'Test Agent',
        role: 'Assistant',
        personality: 'Helpful and friendly',
      };

      const result = SanitizedCreateAgentSchema.parse(agentData);
      expect(result.isActive).toBe(true);
    });

    it('should reject invalid agent data', () => {
      expect(() =>
        SanitizedCreateAgentSchema.parse({
          name: '',
          role: 'Assistant',
          personality: 'Helpful and friendly',
          isActive: true,
        }),
      ).toThrow();

      expect(() =>
        SanitizedCreateAgentSchema.parse({
          name: 'Test Agent',
          role: '',
          personality: 'Helpful and friendly',
          isActive: true,
        }),
      ).toThrow();

      expect(() =>
        SanitizedCreateAgentSchema.parse({
          name: 'Test Agent',
          role: 'Assistant',
          personality: '',
          isActive: true,
        }),
      ).toThrow();
    });
  });

  describe('SanitizedUpdateAgentSchema', () => {
    it('should validate update data with UUID', () => {
      const updateData = {
        id: uuidv4(),
        name: 'Updated Agent',
        role: 'Updated Role',
      };

      const result = SanitizedUpdateAgentSchema.parse(updateData);
      expect(result.id).toBe(updateData.id);
      expect(result.name).toBe('Updated Agent');
      expect(result.role).toBe('Updated Role');
    });

    it('should allow partial updates', () => {
      const updateData = {
        id: uuidv4(),
        name: 'Updated Agent',
      };

      const result = SanitizedUpdateAgentSchema.parse(updateData);
      expect(result.id).toBe(updateData.id);
      expect(result.name).toBe('Updated Agent');
      expect(result.role).toBeUndefined();
    });

    it('should reject invalid UUID', () => {
      expect(() =>
        SanitizedUpdateAgentSchema.parse({
          id: 'invalid-uuid',
          name: 'Updated Agent',
        }),
      ).toThrow();
    });
  });

  describe('SanitizedCreateConversationSchema', () => {
    it('should validate and sanitize conversation data', () => {
      const conversationData = {
        name: '  Test Conversation  ',
        description: 'A test conversation',
        isActive: true,
      };

      const result = SanitizedCreateConversationSchema.parse(conversationData);
      expect(result.name).toBe('Test Conversation');
      expect(result.description).toBe('A test conversation');
      expect(result.isActive).toBe(true);
    });

    it('should use default values', () => {
      const conversationData = {
        name: 'Test Conversation',
      };

      const result = SanitizedCreateConversationSchema.parse(conversationData);
      expect(result.name).toBe('Test Conversation');
      expect(result.description).toBe('');
      expect(result.isActive).toBe(true);
    });
  });

  describe('SanitizedCreateMessageSchema', () => {
    it('should validate and sanitize message data', () => {
      const messageData = {
        conversationId: uuidv4(),
        agentId: uuidv4(),
        content: '  Hello World  ',
        type: 'text',
        metadata: '{"key": "value"}',
      };

      const result = SanitizedCreateMessageSchema.parse(messageData);
      expect(result.conversationId).toBe(messageData.conversationId);
      expect(result.agentId).toBe(messageData.agentId);
      expect(result.content).toBe('Hello World');
      expect(result.type).toBe('text');
      expect(result.metadata).toBe('{"key": "value"}');
    });

    it('should use default metadata', () => {
      const messageData = {
        conversationId: uuidv4(),
        agentId: uuidv4(),
        content: 'Hello World',
        type: 'text',
      };

      const result = SanitizedCreateMessageSchema.parse(messageData);
      expect(result.metadata).toBe('{}');
    });

    it('should validate JSON metadata', () => {
      const messageData = {
        conversationId: uuidv4(),
        agentId: uuidv4(),
        content: 'Hello World',
        type: 'text',
        metadata: 'invalid json',
      };

      expect(() => SanitizedCreateMessageSchema.parse(messageData)).toThrow();
    });

    it('should reject invalid UUIDs', () => {
      expect(() =>
        SanitizedCreateMessageSchema.parse({
          conversationId: 'invalid-uuid',
          agentId: uuidv4(),
          content: 'Hello World',
          type: 'text',
        }),
      ).toThrow();

      expect(() =>
        SanitizedCreateMessageSchema.parse({
          conversationId: uuidv4(),
          agentId: 'invalid-uuid',
          content: 'Hello World',
          type: 'text',
        }),
      ).toThrow();
    });
  });

  describe('DatabaseFilterSchema', () => {
    it('should validate database filter options', () => {
      const filter = {
        limit: 100,
        offset: 0,
        sortBy: 'name',
        sortOrder: 'asc' as const,
        where: { active: true },
      };

      const result = DatabaseFilterSchema.parse(filter);
      expect(result.limit).toBe(100);
      expect(result.offset).toBe(0);
      expect(result.sortBy).toBe('name');
      expect(result.sortOrder).toBe('asc');
      expect(result.where).toEqual({ active: true });
    });

    it('should use default sort order', () => {
      const filter = {
        limit: 100,
      };

      const result = DatabaseFilterSchema.parse(filter);
      expect(result.sortOrder).toBe('asc');
    });

    it('should reject invalid limit values', () => {
      expect(() => DatabaseFilterSchema.parse({ limit: 0 })).toThrow();
      expect(() => DatabaseFilterSchema.parse({ limit: 1001 })).toThrow();
      expect(() => DatabaseFilterSchema.parse({ limit: -1 })).toThrow();
    });

    it('should reject invalid offset values', () => {
      expect(() => DatabaseFilterSchema.parse({ offset: -1 })).toThrow();
    });
  });

  describe('Transaction Schemas', () => {
    describe('TransactionCreateConversationWithAgentsSchema', () => {
      it('should validate conversation with agents transaction', () => {
        const data = {
          conversationData: {
            name: 'Test Conversation',
            description: 'A test conversation',
            isActive: true,
          },
          agentIds: [uuidv4(), uuidv4()],
        };

        expect(() => TransactionCreateConversationWithAgentsSchema.parse(data)).not.toThrow();
      });

      it('should reject invalid agent IDs', () => {
        const data = {
          conversationData: {
            name: 'Test Conversation',
            description: 'A test conversation',
            isActive: true,
          },
          agentIds: ['invalid-uuid'],
        };

        expect(() => TransactionCreateConversationWithAgentsSchema.parse(data)).toThrow();
      });
    });

    describe('TransactionDeleteConversationCascadeSchema', () => {
      it('should validate conversation ID for cascade delete', () => {
        const data = {
          conversationId: uuidv4(),
        };

        expect(() => TransactionDeleteConversationCascadeSchema.parse(data)).not.toThrow();
      });

      it('should reject invalid conversation ID', () => {
        const data = {
          conversationId: 'invalid-uuid',
        };

        expect(() => TransactionDeleteConversationCascadeSchema.parse(data)).toThrow();
      });
    });

    describe('TransactionTransferMessagesSchema', () => {
      it('should validate message transfer transaction', () => {
        const data = {
          fromConversationId: uuidv4(),
          toConversationId: uuidv4(),
          messageIds: [uuidv4(), uuidv4()],
        };

        expect(() => TransactionTransferMessagesSchema.parse(data)).not.toThrow();
      });

      it('should reject invalid UUIDs', () => {
        const data = {
          fromConversationId: 'invalid-uuid',
          toConversationId: uuidv4(),
          messageIds: [uuidv4()],
        };

        expect(() => TransactionTransferMessagesSchema.parse(data)).toThrow();
      });
    });
  });
});
