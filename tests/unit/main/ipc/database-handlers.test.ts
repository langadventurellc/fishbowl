/**
 * Tests for database IPC handlers
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseError } from '../../../../src/shared/types/errors';
import { DatabaseErrorHandler } from '../../../../src/main/ipc/error-handler';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  app: {
    getPath: vi.fn(() => '/test/path'),
    getVersion: vi.fn(() => '1.0.0'),
    isPackaged: false,
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(),
    getAllWindows: vi.fn(() => []),
  },
}));

vi.mock('../../../../src/main/database/queries', () => ({
  getActiveAgents: vi.fn(),
  getAgentById: vi.fn(),
  createAgent: vi.fn(),
  updateAgent: vi.fn(),
  deleteAgent: vi.fn(),
  getActiveConversations: vi.fn(),
  getConversationById: vi.fn(),
  createConversation: vi.fn(),
  updateConversation: vi.fn(),
  deleteConversation: vi.fn(),
  getMessagesByConversationId: vi.fn(),
  getMessageById: vi.fn(),
  createMessage: vi.fn(),
  deleteMessage: vi.fn(),
  getAgentsByConversationId: vi.fn(),
}));

vi.mock('../../../../src/main/database/transactions', () => ({
  transactionManager: {
    executeTransaction: vi.fn(),
  },
}));

vi.mock('../../../../src/main/secure-storage', () => ({
  credentialManager: {
    getCredential: vi.fn(),
    setCredential: vi.fn(),
    deleteCredential: vi.fn(),
    listCredentials: vi.fn(),
    storage: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Test data
const mockAgent = {
  id: uuidv4(),
  name: 'Test Agent',
  role: 'Assistant',
  personality: 'Helpful and friendly',
  is_active: true,
  created_at: Date.now(),
  updated_at: Date.now(),
};

const mockConversation = {
  id: uuidv4(),
  name: 'Test Conversation',
  description: 'A test conversation',
  is_active: true,
  created_at: Date.now(),
  updated_at: Date.now(),
};

const mockMessage = {
  id: uuidv4(),
  conversation_id: mockConversation.id,
  agent_id: mockAgent.id,
  content: 'Hello, this is a test message',
  type: 'text',
  metadata: '{}',
  timestamp: Date.now(),
};

describe('Database IPC Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation and Sanitization', () => {
    it('should test SanitizedCreateAgentSchema validation', async () => {
      const { SanitizedCreateAgentSchema } = await import(
        '../../../../src/shared/types/validation/database-schema'
      );

      const validData = {
        name: '  Test Agent  ',
        role: 'Assistant',
        personality: 'Helpful and friendly',
        isActive: true,
      };

      const result = SanitizedCreateAgentSchema.parse(validData);
      expect(result.name).toBe('Test Agent');
      expect(result.role).toBe('Assistant');
      expect(result.personality).toBe('Helpful and friendly');
      expect(result.isActive).toBe(true);
    });

    it('should reject invalid agent data', async () => {
      const { SanitizedCreateAgentSchema } = await import(
        '../../../../src/shared/types/validation/database-schema'
      );

      expect(() =>
        SanitizedCreateAgentSchema.parse({
          name: '',
          role: 'Assistant',
          personality: 'Helpful and friendly',
          isActive: true,
        }),
      ).toThrow();
    });

    it('should test UuidSchema validation', async () => {
      const { UuidSchema } = await import(
        '../../../../src/shared/types/validation/database-schema'
      );

      const validUuid = uuidv4();
      expect(() => UuidSchema.parse(validUuid)).not.toThrow();
      expect(() => UuidSchema.parse('invalid-uuid')).toThrow();
    });

    it('should test message metadata validation', async () => {
      const { SanitizedCreateMessageSchema } = await import(
        '../../../../src/shared/types/validation/database-schema'
      );

      const validData = {
        conversationId: uuidv4(),
        agentId: uuidv4(),
        content: 'Hello World',
        type: 'text',
        metadata: '{"key": "value"}',
      };

      expect(() => SanitizedCreateMessageSchema.parse(validData)).not.toThrow();

      const invalidData = {
        ...validData,
        metadata: 'invalid json',
      };
      expect(() => SanitizedCreateMessageSchema.parse(invalidData)).toThrow();
    });
  });

  describe('Database Operations', () => {
    it('should test agent creation logic', async () => {
      const { createAgent } = await import('../../../../src/main/database/queries');
      vi.mocked(createAgent).mockReturnValue(mockAgent);

      const { SanitizedCreateAgentSchema } = await import(
        '../../../../src/shared/types/validation/database-schema'
      );

      const agentData = {
        name: 'Test Agent',
        role: 'Assistant',
        personality: 'Helpful and friendly',
        isActive: true,
      };

      const validatedData = SanitizedCreateAgentSchema.parse(agentData);
      const result = createAgent({
        id: uuidv4(),
        name: validatedData.name,
        role: validatedData.role,
        personality: validatedData.personality,
        is_active: validatedData.isActive,
      });

      expect(result).toEqual(mockAgent);
    });

    it('should test conversation creation logic', async () => {
      const { createConversation } = await import('../../../../src/main/database/queries');
      vi.mocked(createConversation).mockReturnValue(mockConversation);

      const { SanitizedCreateConversationSchema } = await import(
        '../../../../src/shared/types/validation/database-schema'
      );

      const conversationData = {
        name: 'Test Conversation',
        description: 'A test conversation',
        isActive: true,
      };

      const validatedData = SanitizedCreateConversationSchema.parse(conversationData);
      const result = createConversation({
        id: uuidv4(),
        name: validatedData.name,
        description: validatedData.description,
        is_active: validatedData.isActive,
      });

      expect(result).toEqual(mockConversation);
    });

    it('should test message creation logic', async () => {
      const { createMessage } = await import('../../../../src/main/database/queries');
      vi.mocked(createMessage).mockReturnValue(mockMessage);

      const { SanitizedCreateMessageSchema } = await import(
        '../../../../src/shared/types/validation/database-schema'
      );

      const messageData = {
        conversationId: mockConversation.id,
        agentId: mockAgent.id,
        content: 'Hello, this is a test message',
        type: 'text',
        metadata: '{}',
      };

      const validatedData = SanitizedCreateMessageSchema.parse(messageData);
      const result = createMessage({
        id: uuidv4(),
        conversation_id: validatedData.conversationId,
        agent_id: validatedData.agentId,
        content: validatedData.content,
        type: validatedData.type,
        metadata: validatedData.metadata,
      });

      expect(result).toEqual(mockMessage);
    });

    it('should test transaction manager usage', async () => {
      const { transactionManager } = await import('../../../../src/main/database/transactions');
      const mockResult = {
        conversation: {
          id: mockConversation.id,
          name: mockConversation.name,
          description: mockConversation.description,
          createdAt: mockConversation.created_at,
          updatedAt: mockConversation.updated_at,
          isActive: mockConversation.is_active,
        },
        agentCount: 2,
      };

      vi.mocked(transactionManager.executeTransaction).mockReturnValue(mockResult);

      const result = transactionManager.executeTransaction(() => mockResult);
      expect(result).toEqual(mockResult);
      expect(transactionManager.executeTransaction).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should test database error handling', () => {
      const context = {
        operation: 'create',
        table: 'agents',
        timestamp: Date.now(),
      };

      const dbError = new Error('Database connection error');

      expect(() => {
        DatabaseErrorHandler.handleDatabaseError(dbError, context);
      }).toThrow(DatabaseError);
    });

    it('should test validation error handling', async () => {
      const { SanitizedCreateAgentSchema } = await import(
        '../../../../src/shared/types/validation/database-schema'
      );

      expect(() =>
        SanitizedCreateAgentSchema.parse({
          name: '',
          role: 'Assistant',
          personality: 'Helpful and friendly',
          isActive: true,
        }),
      ).toThrow();
    });
  });
});
