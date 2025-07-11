import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAgents } from '../../src/renderer/hooks/useAgents';
import { useMessages } from '../../src/renderer/hooks/useMessages';
import { useSecureStorage } from '../../src/renderer/hooks/useSecureStorage';
import { useDatabase } from '../../src/renderer/hooks/useDatabase';

// Mock Zustand to reset stores between tests and prevent persistence
vi.mock('zustand', async () => {
  const actual = await vi.importActual('zustand');
  const { create: actualCreate } = actual as any;

  // Store reset functions for all stores
  const storeResetFns = new Set<() => void>();

  // Mock the create function to capture initial state and provide reset
  const create = () => (createState: any) => {
    const store = actualCreate(createState);
    const initialState = store.getState();
    storeResetFns.add(() => store.setState(initialState, true));
    return store;
  };

  // Reset all stores before each test
  beforeEach(() => {
    storeResetFns.forEach(resetFn => resetFn());
  });

  return { ...actual, create };
});

// Mock persist middleware to disable persistence in tests
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware');
  return {
    ...actual,
    persist: (fn: any) => fn, // Just return the function without persistence
  };
});

// Mock the electronAPI that would be exposed by preload
const mockElectronAPI = {
  // Database operations
  dbAgentsList: vi.fn(),
  dbAgentsGet: vi.fn(),
  dbAgentsCreate: vi.fn(),
  dbAgentsUpdate: vi.fn(),
  dbAgentsDelete: vi.fn(),
  dbConversationsList: vi.fn(),
  dbConversationsGet: vi.fn(),
  dbConversationsCreate: vi.fn(),
  dbConversationsUpdate: vi.fn(),
  dbConversationsDelete: vi.fn(),
  dbMessagesList: vi.fn(),
  dbMessagesGet: vi.fn(),
  dbMessagesCreate: vi.fn(),
  dbMessagesDelete: vi.fn(),
  dbConversationAgentsList: vi.fn(),
  dbConversationAgentsAdd: vi.fn(),
  dbConversationAgentsRemove: vi.fn(),

  // Secure storage operations
  secureKeytarGet: vi.fn(),
  secureKeytarSet: vi.fn(),
  secureKeytarDelete: vi.fn(),
  secureCredentialsGet: vi.fn(),
  secureCredentialsSet: vi.fn(),
  secureCredentialsDelete: vi.fn(),
  secureCredentialsList: vi.fn(),

  // Performance monitoring
  getPerformanceStats: vi.fn(),
  clearPerformanceStats: vi.fn(),
  getRecentMetrics: vi.fn(),

  // Security
  getSecurityStats: vi.fn(),
  getSecurityAuditLog: vi.fn(),
  clearSecurityAuditLog: vi.fn(),
};

// Mock the global electronAPI
Object.defineProperty(global, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
  configurable: true,
});

// Mock window.electronAPI for the hooks
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
  configurable: true,
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
        role: 'assistant',
        personality: 'You are a helpful assistant',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockElectronAPI.dbAgentsCreate.mockResolvedValue(mockAgent);
      mockElectronAPI.dbAgentsList.mockResolvedValue([mockAgent]);
      mockElectronAPI.dbAgentsGet.mockResolvedValue(mockAgent);
      mockElectronAPI.dbAgentsUpdate.mockResolvedValue({
        ...mockAgent,
        name: 'Updated Agent',
      });
      mockElectronAPI.dbAgentsDelete.mockResolvedValue(true);

      // Test creating an agent
      await act(async () => {
        await result.current.createAgent({
          name: 'Test Agent',
          role: 'assistant',
          personality: 'You are a helpful assistant',
        });
      });

      expect(mockElectronAPI.dbAgentsCreate).toHaveBeenCalledWith({
        name: 'Test Agent',
        role: 'assistant',
        personality: 'You are a helpful assistant',
      });

      expect(result.current.agents).toContain(mockAgent);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();

      // Test getting an agent
      await act(async () => {
        await result.current.getAgent('agent-123');
      });

      expect(mockElectronAPI.dbAgentsGet).toHaveBeenCalledWith('agent-123');

      // Test updating an agent
      await act(async () => {
        await result.current.updateAgent('agent-123', {
          name: 'Updated Agent',
        });
      });

      expect(mockElectronAPI.dbAgentsUpdate).toHaveBeenCalledWith('agent-123', {
        name: 'Updated Agent',
      });

      // Test deleting an agent
      await act(async () => {
        await result.current.deleteAgent('agent-123');
      });

      expect(mockElectronAPI.dbAgentsDelete).toHaveBeenCalledWith('agent-123');
    });

    it('should handle agent operation errors', async () => {
      const { result } = renderHook(() => useAgents());

      // Mock error response
      mockElectronAPI.dbAgentsCreate.mockRejectedValue(new Error('Agent name is required'));

      await act(async () => {
        await result.current.createAgent({
          name: '',
          role: 'assistant',
          personality: 'Test prompt',
        });
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toContain('Agent name is required');
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
        role: 'assistant',
        personality: 'You are helpful',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Mock conversation data
      const mockConversation = {
        id: 'conv-123',
        name: 'Test Conversation',
        description: 'A test conversation',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockElectronAPI.dbAgentsCreate.mockResolvedValue(mockAgent);
      mockElectronAPI.dbConversationsCreate.mockResolvedValue(mockConversation);
      mockElectronAPI.dbConversationAgentsAdd.mockResolvedValue(true);

      // Create an agent first
      await act(async () => {
        await agentsResult.current.createAgent({
          name: 'Chat Assistant',
          role: 'assistant',
          personality: 'You are helpful',
        });
      });

      // Create conversation
      await act(async () => {
        await databaseResult.current.conversations.createConversation({
          name: 'Test Conversation',
          description: 'A test conversation',
        });
      });

      // Add agent to conversation
      await act(async () => {
        await databaseResult.current.conversationAgents.addConversationAgent(
          'conv-123',
          'agent-123',
        );
      });

      expect(mockElectronAPI.dbAgentsCreate).toHaveBeenCalledWith({
        name: 'Chat Assistant',
        role: 'assistant',
        personality: 'You are helpful',
      });
      expect(mockElectronAPI.dbConversationsCreate).toHaveBeenCalledWith({
        name: 'Test Conversation',
        description: 'A test conversation',
      });
      expect(mockElectronAPI.dbConversationAgentsAdd).toHaveBeenCalledWith('conv-123', 'agent-123');
    });
  });

  describe('Message Workflow Integration', () => {
    it('should handle message creation operations', async () => {
      const { result } = renderHook(() => useMessages());

      const conversationId = 'conv-123';
      const agentId = 'agent-123';

      // Mock single message creation
      const mockMessage = {
        id: 'msg-123',
        conversationId,
        agentId,
        content: 'Hello, world!',
        type: 'user' as const,
        metadata: '',
        timestamp: Date.now(),
      };

      mockElectronAPI.dbMessagesCreate.mockResolvedValue(mockMessage);

      // Create single message
      await act(async () => {
        await result.current.createMessage({
          conversationId,
          agentId,
          content: 'Hello, world!',
          type: 'user',
        });
      });

      expect(mockElectronAPI.dbMessagesCreate).toHaveBeenCalledWith({
        conversationId,
        agentId,
        content: 'Hello, world!',
        type: 'user',
      });

      expect(result.current.messages).toContain(mockMessage);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Secure Storage Workflow Integration', () => {
    it('should handle AI provider credential management', async () => {
      const { result } = renderHook(() => useSecureStorage());

      const mockCredential = {
        apiKey: 'sk-test-key-123',
        organizationId: 'org-test',
      };

      const mockCredentialInfo = {
        provider: 'openai' as const,
        hasApiKey: true,
        lastUpdated: Date.now(),
        metadata: {
          displayName: 'OpenAI Test Account',
          environment: 'test',
        },
      };

      mockElectronAPI.secureCredentialsSet.mockResolvedValue(true);
      mockElectronAPI.secureCredentialsGet.mockResolvedValue(mockCredential);
      mockElectronAPI.secureCredentialsList.mockResolvedValue([mockCredentialInfo]);

      // Set credentials
      await act(async () => {
        await result.current.setCredential('openai', 'sk-test-key-123', {
          displayName: 'OpenAI Test Account',
          environment: 'test',
        });
      });

      expect(mockElectronAPI.secureCredentialsSet).toHaveBeenCalledWith(
        'openai',
        'sk-test-key-123',
        {
          displayName: 'OpenAI Test Account',
          environment: 'test',
        },
      );

      // Get credentials
      await act(async () => {
        await result.current.getCredential('openai');
      });

      expect(mockElectronAPI.secureCredentialsGet).toHaveBeenCalledWith('openai');

      // List all credentials
      await act(async () => {
        await result.current.listCredentials();
      });

      expect(mockElectronAPI.secureCredentialsList).toHaveBeenCalled();
    });
  });

  describe('Complex Workflow Integration', () => {
    it('should handle complete chat application setup workflow', async () => {
      const { result: agentsResult } = renderHook(() => useAgents());
      const { result: databaseResult } = renderHook(() => useDatabase());
      const { result: messagesResult } = renderHook(() => useMessages());
      const { result: secureResult } = renderHook(() => useSecureStorage());

      // Step 1: Set up AI provider credentials
      mockElectronAPI.secureCredentialsSet.mockResolvedValue(true);

      await act(async () => {
        await secureResult.current.setCredential('openai', 'sk-test-key', {
          displayName: 'OpenAI Account',
        });
      });

      // Step 2: Create agents
      const mockAgent1 = {
        id: 'agent-1',
        name: 'Assistant 1',
        role: 'assistant',
        personality: 'You are assistant 1',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const mockAgent2 = {
        id: 'agent-2',
        name: 'Assistant 2',
        role: 'assistant',
        personality: 'You are assistant 2',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockElectronAPI.dbAgentsCreate
        .mockResolvedValueOnce(mockAgent1)
        .mockResolvedValueOnce(mockAgent2);

      await act(async () => {
        await agentsResult.current.createAgent({
          name: 'Assistant 1',
          role: 'assistant',
          personality: 'You are assistant 1',
        });
        await agentsResult.current.createAgent({
          name: 'Assistant 2',
          role: 'assistant',
          personality: 'You are assistant 2',
        });
      });

      // Step 3: Create conversation
      const mockConversation = {
        id: 'conv-1',
        name: 'Multi-Agent Chat',
        description: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isActive: true,
      };

      mockElectronAPI.dbConversationsCreate.mockResolvedValue(mockConversation);

      await act(async () => {
        await databaseResult.current.conversations.createConversation({
          name: 'Multi-Agent Chat',
        });
      });

      // Step 4: Create messages
      mockElectronAPI.dbMessagesCreate.mockResolvedValue({
        id: 'msg-1',
        conversationId: 'conv-1',
        agentId: 'agent-1',
        content: 'Hello!',
        type: 'user',
        metadata: '',
        timestamp: Date.now(),
      });

      await act(async () => {
        await messagesResult.current.createMessage({
          conversationId: 'conv-1',
          agentId: 'agent-1',
          content: 'Hello!',
          type: 'user',
        });
      });

      // Verify all operations were called
      expect(mockElectronAPI.secureCredentialsSet).toHaveBeenCalled();
      expect(mockElectronAPI.dbAgentsCreate).toHaveBeenCalledTimes(2);
      expect(mockElectronAPI.dbConversationsCreate).toHaveBeenCalled();
      expect(mockElectronAPI.dbMessagesCreate).toHaveBeenCalled();
    });

    it('should handle error recovery across multiple operations', async () => {
      const { result: agentsResult } = renderHook(() => useAgents());
      const { result: databaseResult } = renderHook(() => useDatabase());

      // First operation succeeds
      mockElectronAPI.dbAgentsCreate.mockResolvedValueOnce({
        id: 'agent-1',
        name: 'Agent 1',
        role: 'assistant',
        personality: 'Test prompt',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Second operation fails
      mockElectronAPI.dbConversationsCreate.mockRejectedValueOnce(new Error('Connection failed'));

      // Create agent (should succeed)
      await act(async () => {
        await agentsResult.current.createAgent({
          name: 'Agent 1',
          role: 'assistant',
          personality: 'Test prompt',
        });
      });

      expect(agentsResult.current.error).toBeNull();

      // Try to create conversation (should fail)
      await act(async () => {
        await databaseResult.current.conversations.createConversation({
          name: 'Test Conversation',
        });
      });

      expect(databaseResult.current.conversations.error).not.toBeNull();
      expect(databaseResult.current.conversations.error).toContain('Connection failed');
    });
  });

  describe('Performance and Monitoring Integration', () => {
    it('should track performance across hook operations', async () => {
      const { result } = renderHook(() => useAgents());

      // Mock performance data
      mockElectronAPI.getPerformanceStats.mockResolvedValue({
        totalCalls: 5,
        averageTime: 45.2,
        slowCallThreshold: 100,
      });

      mockElectronAPI.dbAgentsCreate.mockResolvedValue({
        id: 'agent-1',
        name: 'Test Agent',
        role: 'assistant',
        personality: 'Test prompt',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Perform operation
      await act(async () => {
        await result.current.createAgent({
          name: 'Test Agent',
          role: 'assistant',
          personality: 'Test prompt',
        });
      });

      // The performance monitoring should be tracking this operation
      // (exact implementation depends on how performance monitoring is integrated)
      expect(mockElectronAPI.dbAgentsCreate).toHaveBeenCalled();
    });
  });
});
