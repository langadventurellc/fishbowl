import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentService } from '../../../../../src/renderer/services/ai/AgentService';
import { ConversationContextService } from '../../../../../src/renderer/services/ai/ConversationContextService';
import { MessageFormatterService } from '../../../../../src/renderer/services/ai/MessageFormatterService';
import { Message, Agent } from '../../../../../src/shared/types';

// Mock the service dependencies
vi.mock('../../../../../src/renderer/services/ai/ConversationContextService');
vi.mock('../../../../../src/renderer/services/ai/MessageFormatterService');

// Create typed mocks
const mockConversationContextService = {
  prepareAIContext: vi.fn(),
  prepareAIContextForConversation: vi.fn(),
  validateFilteredContext: vi.fn(),
};

const mockMessageFormatterService = {
  formatMessageForAI: vi.fn(),
  formatMessagesForAI: vi.fn(),
  createSystemMessage: vi.fn(),
  prepareConversationContext: vi.fn(),
};

describe('AgentService', () => {
  let service: AgentService;
  let mockMessages: Message[];
  let mockAgent: Agent;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Set up default mock implementations
    mockConversationContextService.prepareAIContext.mockReturnValue([]);
    mockConversationContextService.validateFilteredContext.mockReturnValue({
      isValid: true,
      totalMessages: 0,
      activeMessages: 0,
      inactiveMessages: 0,
    });

    mockMessageFormatterService.prepareConversationContext.mockReturnValue([]);

    // Mock the constructor to return our mock instances
    vi.mocked(ConversationContextService).mockImplementation(
      () => mockConversationContextService as any,
    );
    vi.mocked(MessageFormatterService).mockImplementation(() => mockMessageFormatterService as any);

    service = new AgentService();

    // Set up test data
    mockMessages = [
      {
        id: 'msg1',
        conversationId: 'conv1',
        agentId: 'agent1',
        type: 'user',
        content: 'Active message 1',
        isActive: true,
        metadata: '{}',
        timestamp: Date.now(),
      },
      {
        id: 'msg2',
        conversationId: 'conv1',
        agentId: 'agent1',
        type: 'assistant',
        content: 'Inactive message',
        isActive: false,
        metadata: '{}',
        timestamp: Date.now() + 1000,
      },
    ];

    mockAgent = {
      id: 'agent1',
      name: 'Test Agent',
      role: 'assistant',
      personality: 'Helpful and friendly',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });

  describe('prepareAIContext', () => {
    it('should prepare AI context with filtered messages', () => {
      const activeMessages = mockMessages.filter(msg => msg.isActive);
      const formattedMessages = [
        { role: 'user' as const, content: 'Active message 1', id: 'msg1' },
      ];

      mockConversationContextService.prepareAIContext.mockReturnValue(activeMessages);
      mockMessageFormatterService.prepareConversationContext.mockReturnValue(formattedMessages);

      const result = service.prepareAIContext(mockMessages, mockAgent);

      expect(mockConversationContextService.prepareAIContext).toHaveBeenCalledWith(mockMessages);
      expect(result).toEqual({
        messages: formattedMessages,
        activeMessageCount: 1,
        totalMessageCount: 2,
        isFiltered: true,
        agent: mockAgent,
      });
    });

    it('should build system prompt from agent when no config provided', () => {
      const activeMessages = mockMessages.filter(msg => msg.isActive);
      const expectedSystemPrompt = 'You are Test Agent, a assistant. Helpful and friendly';

      mockConversationContextService.prepareAIContext.mockReturnValue(activeMessages);
      mockMessageFormatterService.prepareConversationContext.mockReturnValue([]);

      service.prepareAIContext(mockMessages, mockAgent);

      expect(mockMessageFormatterService.prepareConversationContext).toHaveBeenCalledWith(
        activeMessages,
        expectedSystemPrompt,
      );
    });

    it('should use provided system prompt over agent-generated one', () => {
      const activeMessages = mockMessages.filter(msg => msg.isActive);
      const customSystemPrompt = 'Custom system prompt';

      mockConversationContextService.prepareAIContext.mockReturnValue(activeMessages);
      mockMessageFormatterService.prepareConversationContext.mockReturnValue([]);

      service.prepareAIContext(mockMessages, mockAgent, {
        systemPrompt: customSystemPrompt,
      });

      expect(mockMessageFormatterService.prepareConversationContext).toHaveBeenCalledWith(
        activeMessages,
        customSystemPrompt,
      );
    });

    it('should handle messages without agent', () => {
      const activeMessages = mockMessages.filter(msg => msg.isActive);
      const formattedMessages = [
        { role: 'user' as const, content: 'Active message 1', id: 'msg1' },
      ];

      mockConversationContextService.prepareAIContext.mockReturnValue(activeMessages);
      mockMessageFormatterService.prepareConversationContext.mockReturnValue(formattedMessages);

      const result = service.prepareAIContext(mockMessages);

      expect(result).toEqual({
        messages: formattedMessages,
        activeMessageCount: 1,
        totalMessageCount: 2,
        isFiltered: true,
        agent: undefined,
      });
    });

    it('should indicate no filtering when all messages are active', () => {
      const allActiveMessages = mockMessages.map(msg => ({ ...msg, isActive: true }));

      mockConversationContextService.prepareAIContext.mockReturnValue(allActiveMessages);
      mockMessageFormatterService.prepareConversationContext.mockReturnValue([]);

      const result = service.prepareAIContext(allActiveMessages);

      expect(result.isFiltered).toBe(false);
      expect(result.activeMessageCount).toBe(2);
      expect(result.totalMessageCount).toBe(2);
    });
  });

  describe('prepareAIContextForConversation', () => {
    it('should retrieve messages and prepare AI context', async () => {
      const mockGetAllMessages = vi.fn().mockResolvedValue(mockMessages);
      const activeMessages = mockMessages.filter(msg => msg.isActive);
      const formattedMessages = [
        { role: 'user' as const, content: 'Active message 1', id: 'msg1' },
      ];

      mockConversationContextService.prepareAIContext.mockReturnValue(activeMessages);
      mockMessageFormatterService.prepareConversationContext.mockReturnValue(formattedMessages);

      const result = await service.prepareAIContextForConversation(
        'conv1',
        mockAgent,
        mockGetAllMessages,
      );

      expect(mockGetAllMessages).toHaveBeenCalledWith('conv1');
      expect(result).toEqual({
        messages: formattedMessages,
        activeMessageCount: 1,
        totalMessageCount: 2,
        isFiltered: true,
        agent: mockAgent,
      });
    });

    it('should handle database errors', async () => {
      const mockGetAllMessages = vi.fn().mockRejectedValue(new Error('Database error'));

      await expect(
        service.prepareAIContextForConversation('conv1', mockAgent, mockGetAllMessages),
      ).rejects.toThrow('Database error');
    });
  });

  describe('validateAIContext', () => {
    it('should validate AI context correctly', () => {
      const mockValidation = {
        isValid: true,
        totalMessages: 2,
        activeMessages: 1,
        inactiveMessages: 1,
      };

      mockConversationContextService.validateFilteredContext.mockReturnValue(mockValidation);

      const result = service.validateAIContext(mockMessages);

      expect(result).toEqual({
        isValid: true,
        totalMessages: 2,
        activeMessages: 1,
        inactiveFiltered: 1,
        hasActiveMessages: true,
      });
    });

    it('should handle empty messages', () => {
      const mockValidation = {
        isValid: true,
        totalMessages: 0,
        activeMessages: 0,
        inactiveMessages: 0,
      };

      mockConversationContextService.validateFilteredContext.mockReturnValue(mockValidation);

      const result = service.validateAIContext([]);

      expect(result).toEqual({
        isValid: true,
        totalMessages: 0,
        activeMessages: 0,
        inactiveFiltered: 0,
        hasActiveMessages: false,
      });
    });
  });

  describe('service accessors', () => {
    it('should provide access to conversation context service', () => {
      const contextService = service.getConversationContextService();
      expect(contextService).toBeDefined();
      expect(typeof contextService.prepareAIContext).toBe('function');
    });

    it('should provide access to message formatter service', () => {
      const formatterService = service.getMessageFormatterService();
      expect(formatterService).toBeDefined();
      expect(typeof formatterService.prepareConversationContext).toBe('function');
    });
  });

  describe('buildSystemPromptFromAgent', () => {
    it('should build system prompt with name only', () => {
      const minimalAgent = {
        ...mockAgent,
        role: '',
        personality: '',
      };

      service.prepareAIContext(mockMessages, minimalAgent);

      expect(mockMessageFormatterService.prepareConversationContext).toHaveBeenCalledWith(
        expect.anything(),
        'You are Test Agent',
      );
    });

    it('should build system prompt with name and role', () => {
      const agentWithRole = {
        ...mockAgent,
        personality: '',
      };

      service.prepareAIContext(mockMessages, agentWithRole);

      expect(mockMessageFormatterService.prepareConversationContext).toHaveBeenCalledWith(
        expect.anything(),
        'You are Test Agent, a assistant',
      );
    });

    it('should build complete system prompt with all fields', () => {
      service.prepareAIContext(mockMessages, mockAgent);

      expect(mockMessageFormatterService.prepareConversationContext).toHaveBeenCalledWith(
        expect.anything(),
        'You are Test Agent, a assistant. Helpful and friendly',
      );
    });
  });
});
