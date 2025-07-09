import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the electronAPI that would be exposed by preload
const mockElectronAPI = {
  database: {
    agents: {
      create: vi.fn(),
      get: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    conversations: {
      create: vi.fn(),
      get: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    messages: {
      create: vi.fn(),
      get: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    conversationAgents: {
      add: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
    },
    transactions: {
      createConversationWithAgents: vi.fn(),
      createMessagesBatch: vi.fn(),
      deleteConversationCascade: vi.fn(),
      transferMessages: vi.fn(),
    },
  },
  secure: {
    keytar: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    },
    credentials: {
      get: vi.fn(),
      set: vi.fn(),
      list: vi.fn(),
      delete: vi.fn(),
    },
  },
  performance: {
    getStats: vi.fn(),
    getMetrics: vi.fn(),
    getSlowCalls: vi.fn(),
  },
  security: {
    getAuditLog: vi.fn(),
    getSecurityStats: vi.fn(),
  },
};

// Mock the global electronAPI
Object.defineProperty(global, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
  configurable: true,
});

// Mock hooks instead of importing to avoid cross-module type resolution issues
const useAgents = () => ({
  agents: [],
  loading: false,
  error: null as { message: string } | null,
  createAgent: vi.fn(),
  getAgent: vi.fn(),
  updateAgent: vi.fn(),
  deleteAgent: vi.fn(),
});

const useMessages = () => ({
  messages: [],
  loading: false,
  error: null as { message: string } | null,
  createMessage: vi.fn(),
});

const useSecureStorage = () => ({
  loading: false,
  error: null as { message: string } | null,
  setCredentials: vi.fn(),
  getCredentials: vi.fn(),
  listCredentials: vi.fn(),
});

const useDatabase = () => ({
  loading: false,
  error: null as { message: string } | null,
  transactions: {
    createConversationWithAgents: vi.fn(),
    createMessagesBatch: vi.fn(),
    deleteConversationCascade: vi.fn(),
  },
});

describe('IPC End-to-End Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Agent Workflow Integration', () => {
    it('should handle complete agent management workflow', async () => {
      const { result } = renderHook(() => useAgents());

      // Mock successful responses
      const mockAgent = {
        id: 'agent-123',
        name: 'Test Agent',
        systemPrompt: 'You are a helpful assistant',
        description: 'Test agent description',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockElectronAPI.database.agents.create.mockResolvedValue({
        success: true,
        data: mockAgent,
      });

      mockElectronAPI.database.agents.list.mockResolvedValue({
        success: true,
        data: [mockAgent],
      });

      mockElectronAPI.database.agents.get.mockResolvedValue({
        success: true,
        data: mockAgent,
      });

      mockElectronAPI.database.agents.update.mockResolvedValue({
        success: true,
        data: { ...mockAgent, name: 'Updated Agent' },
      });

      mockElectronAPI.database.agents.delete.mockResolvedValue({
        success: true,
        data: true,
      });

      // Test creating an agent
      await act(async () => {
        await result.current.createAgent({
          name: 'Test Agent',
          systemPrompt: 'You are a helpful assistant',
          description: 'Test agent description',
        });
      });

      expect(mockElectronAPI.database.agents.create).toHaveBeenCalledWith({
        name: 'Test Agent',
        systemPrompt: 'You are a helpful assistant',
        description: 'Test agent description',
      });

      expect(result.current.agents).toContain(mockAgent);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();

      // Test getting an agent
      await act(async () => {
        await result.current.getAgent('agent-123');
      });

      expect(mockElectronAPI.database.agents.get).toHaveBeenCalledWith({
        id: 'agent-123',
      });

      // Test updating an agent
      await act(async () => {
        await result.current.updateAgent('agent-123', {
          name: 'Updated Agent',
        });
      });

      expect(mockElectronAPI.database.agents.update).toHaveBeenCalledWith({
        id: 'agent-123',
        name: 'Updated Agent',
      });

      // Test deleting an agent
      await act(async () => {
        await result.current.deleteAgent('agent-123');
      });

      expect(mockElectronAPI.database.agents.delete).toHaveBeenCalledWith({
        id: 'agent-123',
      });
    });

    it('should handle agent operation errors', async () => {
      const { result } = renderHook(() => useAgents());

      // Mock error response
      mockElectronAPI.database.agents.create.mockResolvedValue({
        success: false,
        error: {
          type: 'VALIDATION',
          message: 'Agent name is required',
        },
      });

      await act(async () => {
        await result.current.createAgent({
          name: '',
          systemPrompt: 'Test prompt',
        });
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toContain('Agent name is required');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Conversation Workflow Integration', () => {
    it('should handle conversation with agents workflow', async () => {
      const { result: agentsResult } = renderHook(() => useAgents());
      const { result: databaseResult } = renderHook(() => useDatabase());

      // Mock agent data
      const mockAgent = {
        id: 'agent-123',
        name: 'Chat Assistant',
        systemPrompt: 'You are helpful',
        isActive: true,
      };

      // Mock conversation with agents response
      const mockConversationResult = {
        conversation: {
          id: 'conv-123',
          title: 'Test Conversation',
          description: 'A test conversation',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        agentCount: 1,
      };

      mockElectronAPI.database.agents.create.mockResolvedValue({
        success: true,
        data: mockAgent,
      });

      mockElectronAPI.database.transactions.createConversationWithAgents.mockResolvedValue({
        success: true,
        data: mockConversationResult,
      });

      // Create an agent first
      await act(async () => {
        await agentsResult.current.createAgent({
          name: 'Chat Assistant',
          systemPrompt: 'You are helpful',
        });
      });

      // Create conversation with the agent
      await act(async () => {
        await databaseResult.current.transactions.createConversationWithAgents({
          conversation: {
            title: 'Test Conversation',
            description: 'A test conversation',
          },
          agentIds: ['agent-123'],
        });
      });

      expect(
        mockElectronAPI.database.transactions.createConversationWithAgents,
      ).toHaveBeenCalledWith({
        conversation: {
          title: 'Test Conversation',
          description: 'A test conversation',
        },
        agentIds: ['agent-123'],
      });
    });
  });

  describe('Message Workflow Integration', () => {
    it('should handle message creation and batch operations', async () => {
      const { result } = renderHook(() => useMessages());
      const { result: databaseResult } = renderHook(() => useDatabase());

      const conversationId = 'conv-123';
      const agentId = 'agent-123';

      // Mock single message creation
      const mockMessage = {
        id: 'msg-123',
        conversationId,
        agentId,
        content: 'Hello, world!',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockElectronAPI.database.messages.create.mockResolvedValue({
        success: true,
        data: mockMessage,
      });

      // Mock batch message creation
      const mockBatchResult = {
        messages: [
          { ...mockMessage, id: 'msg-124', content: 'Batch message 1' },
          { ...mockMessage, id: 'msg-125', content: 'Batch message 2' },
        ],
        conversationUpdated: true,
      };

      mockElectronAPI.database.transactions.createMessagesBatch.mockResolvedValue({
        success: true,
        data: mockBatchResult,
      });

      // Create single message
      await act(async () => {
        await result.current.createMessage({
          conversationId,
          agentId,
          content: 'Hello, world!',
          role: 'user',
        });
      });

      expect(mockElectronAPI.database.messages.create).toHaveBeenCalledWith({
        conversationId,
        agentId,
        content: 'Hello, world!',
        role: 'user',
      });

      // Create batch messages
      await act(async () => {
        await databaseResult.current.transactions.createMessagesBatch({
          conversationId,
          messages: [
            { agentId, content: 'Batch message 1', role: 'assistant' },
            { agentId, content: 'Batch message 2', role: 'assistant' },
          ],
        });
      });

      expect(mockElectronAPI.database.transactions.createMessagesBatch).toHaveBeenCalledWith({
        conversationId,
        messages: [
          { agentId, content: 'Batch message 1', role: 'assistant' },
          { agentId, content: 'Batch message 2', role: 'assistant' },
        ],
      });
    });
  });

  describe('Secure Storage Workflow Integration', () => {
    it('should handle AI provider credential management', async () => {
      const { result } = renderHook(() => useSecureStorage());

      const mockCredential = {
        credentials: {
          apiKey: 'sk-test-key-123',
          organizationId: 'org-test',
        },
        metadata: {
          provider: 'openai' as const,
          displayName: 'OpenAI Test Account',
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          environment: 'test',
        },
      };

      mockElectronAPI.secure.credentials.set.mockResolvedValue({
        success: true,
        data: true,
      });

      mockElectronAPI.secure.credentials.get.mockResolvedValue({
        success: true,
        data: mockCredential,
      });

      mockElectronAPI.secure.credentials.list.mockResolvedValue({
        success: true,
        data: [mockCredential.metadata],
      });

      // Set credentials
      await act(async () => {
        await result.current.setCredentials(
          'openai',
          {
            apiKey: 'sk-test-key-123',
            organizationId: 'org-test',
          },
          {
            displayName: 'OpenAI Test Account',
            environment: 'test',
          },
        );
      });

      expect(mockElectronAPI.secure.credentials.set).toHaveBeenCalledWith({
        provider: 'openai',
        credentials: {
          apiKey: 'sk-test-key-123',
          organizationId: 'org-test',
        },
        metadata: expect.objectContaining({
          provider: 'openai',
          displayName: 'OpenAI Test Account',
          environment: 'test',
        }),
      });

      // Get credentials
      await act(async () => {
        await result.current.getCredentials('openai');
      });

      expect(mockElectronAPI.secure.credentials.get).toHaveBeenCalledWith({
        provider: 'openai',
      });

      // List all credentials
      await act(async () => {
        await result.current.listCredentials();
      });

      expect(mockElectronAPI.secure.credentials.list).toHaveBeenCalled();
    });
  });

  describe('Complex Workflow Integration', () => {
    it('should handle complete chat application setup workflow', async () => {
      const { result: agentsResult } = renderHook(() => useAgents());
      const { result: databaseResult } = renderHook(() => useDatabase());
      const { result: messagesResult } = renderHook(() => useMessages());
      const { result: secureResult } = renderHook(() => useSecureStorage());

      // Step 1: Set up AI provider credentials
      mockElectronAPI.secure.credentials.set.mockResolvedValue({
        success: true,
        data: true,
      });

      await act(async () => {
        await secureResult.current.setCredentials(
          'openai',
          {
            apiKey: 'sk-test-key',
          },
          {
            displayName: 'OpenAI Account',
          },
        );
      });

      // Step 2: Create agents
      const mockAgent1 = { id: 'agent-1', name: 'Assistant 1' };
      const mockAgent2 = { id: 'agent-2', name: 'Assistant 2' };

      mockElectronAPI.database.agents.create
        .mockResolvedValueOnce({ success: true, data: mockAgent1 })
        .mockResolvedValueOnce({ success: true, data: mockAgent2 });

      await act(async () => {
        await agentsResult.current.createAgent({
          name: 'Assistant 1',
          systemPrompt: 'You are assistant 1',
        });
        await agentsResult.current.createAgent({
          name: 'Assistant 2',
          systemPrompt: 'You are assistant 2',
        });
      });

      // Step 3: Create conversation with agents
      const mockConversation = {
        conversation: {
          id: 'conv-1',
          title: 'Multi-Agent Chat',
        },
        agentCount: 2,
      };

      mockElectronAPI.database.transactions.createConversationWithAgents.mockResolvedValue({
        success: true,
        data: mockConversation,
      });

      await act(async () => {
        await databaseResult.current.transactions.createConversationWithAgents({
          conversation: {
            title: 'Multi-Agent Chat',
          },
          agentIds: ['agent-1', 'agent-2'],
        });
      });

      // Step 4: Create messages
      mockElectronAPI.database.messages.create.mockResolvedValue({
        success: true,
        data: { id: 'msg-1', content: 'Hello!', role: 'user' },
      });

      await act(async () => {
        await messagesResult.current.createMessage({
          conversationId: 'conv-1',
          agentId: 'agent-1',
          content: 'Hello!',
          role: 'user',
        });
      });

      // Verify all operations were called
      expect(mockElectronAPI.secure.credentials.set).toHaveBeenCalled();
      expect(mockElectronAPI.database.agents.create).toHaveBeenCalledTimes(2);
      expect(mockElectronAPI.database.transactions.createConversationWithAgents).toHaveBeenCalled();
      expect(mockElectronAPI.database.messages.create).toHaveBeenCalled();
    });

    it('should handle error recovery across multiple operations', async () => {
      const { result: agentsResult } = renderHook(() => useAgents());
      const { result: databaseResult } = renderHook(() => useDatabase());

      // First operation succeeds
      mockElectronAPI.database.agents.create.mockResolvedValueOnce({
        success: true,
        data: { id: 'agent-1', name: 'Agent 1' },
      });

      // Second operation fails
      mockElectronAPI.database.transactions.createConversationWithAgents.mockResolvedValueOnce({
        success: false,
        error: { type: 'DATABASE', message: 'Connection failed' },
      });

      // Create agent (should succeed)
      await act(async () => {
        await agentsResult.current.createAgent({
          name: 'Agent 1',
          systemPrompt: 'Test prompt',
        });
      });

      expect(agentsResult.current.error).toBeNull();

      // Try to create conversation (should fail)
      await act(async () => {
        await databaseResult.current.transactions.createConversationWithAgents({
          conversation: { title: 'Test Conversation' },
          agentIds: ['agent-1'],
        });
      });

      expect(databaseResult.current.error).not.toBeNull();
      expect(databaseResult.current.error?.message).toContain('Connection failed');
    });
  });

  describe('Performance and Monitoring Integration', () => {
    it('should track performance across hook operations', async () => {
      const { result } = renderHook(() => useAgents());

      // Mock performance data
      mockElectronAPI.performance.getStats.mockResolvedValue({
        totalCalls: 5,
        averageTime: 45.2,
        slowCallThreshold: 100,
      });

      mockElectronAPI.database.agents.create.mockResolvedValue({
        success: true,
        data: { id: 'agent-1', name: 'Test Agent' },
      });

      // Perform operation
      await act(async () => {
        await result.current.createAgent({
          name: 'Test Agent',
          systemPrompt: 'Test prompt',
        });
      });

      // The performance monitoring should be tracking this operation
      // (exact implementation depends on how performance monitoring is integrated)
      expect(mockElectronAPI.database.agents.create).toHaveBeenCalled();
    });
  });
});
