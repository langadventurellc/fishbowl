import { describe, it, expect, beforeEach } from 'vitest';
import { MessageFormatterService } from '../../../../../src/renderer/services/ai/MessageFormatterService';
import { Message } from '../../../../../src/shared/types';

describe('MessageFormatterService', () => {
  let service: MessageFormatterService;
  let mockMessage: Message;

  beforeEach(() => {
    service = new MessageFormatterService();

    mockMessage = {
      id: 'msg1',
      conversationId: 'conv1',
      agentId: 'agent1',
      type: 'user',
      content: 'Test message content',
      isActive: true,
      metadata: '{}',
      timestamp: Date.now(),
    };
  });

  describe('formatMessageForAI', () => {
    it('should format user message correctly', () => {
      const result = service.formatMessageForAI(mockMessage);

      expect(result).toEqual({
        role: 'user',
        content: 'Test message content',
        id: 'msg1',
        createdAt: new Date(mockMessage.timestamp),
      });
    });

    it('should format assistant message correctly', () => {
      const assistantMessage = { ...mockMessage, type: 'assistant' };

      const result = service.formatMessageForAI(assistantMessage);

      expect(result).toEqual({
        role: 'assistant',
        content: 'Test message content',
        id: 'msg1',
        createdAt: new Date(mockMessage.timestamp),
      });
    });

    it('should format system message correctly', () => {
      const systemMessage = { ...mockMessage, type: 'system' };

      const result = service.formatMessageForAI(systemMessage);

      expect(result).toEqual({
        role: 'system',
        content: 'Test message content',
        id: 'msg1',
        createdAt: new Date(mockMessage.timestamp),
      });
    });

    it('should default to assistant role for unknown message types', () => {
      const unknownMessage = { ...mockMessage, type: 'unknown' };

      const result = service.formatMessageForAI(unknownMessage);

      expect(result.role).toBe('assistant');
    });

    it('should handle different message type cases', () => {
      const testCases = [
        { type: 'USER', expected: 'user' },
        { type: 'Human', expected: 'user' },
        { type: 'ASSISTANT', expected: 'assistant' },
        { type: 'AI', expected: 'assistant' },
        { type: 'bot', expected: 'assistant' },
        { type: 'SYSTEM', expected: 'system' },
      ];

      testCases.forEach(({ type, expected }) => {
        const message = { ...mockMessage, type };
        const result = service.formatMessageForAI(message);
        expect(result.role).toBe(expected);
      });
    });
  });

  describe('formatMessagesForAI', () => {
    it('should format multiple messages correctly', () => {
      const messages: Message[] = [
        { ...mockMessage, id: 'msg1', type: 'user' },
        { ...mockMessage, id: 'msg2', type: 'assistant' },
        { ...mockMessage, id: 'msg3', type: 'system' },
      ];

      const result = service.formatMessagesForAI(messages);

      expect(result).toHaveLength(3);
      expect(result[0].role).toBe('user');
      expect(result[1].role).toBe('assistant');
      expect(result[2].role).toBe('system');
    });

    it('should handle empty message array', () => {
      const result = service.formatMessagesForAI([]);

      expect(result).toEqual([]);
    });

    it('should preserve message order', () => {
      const messages: Message[] = [
        { ...mockMessage, id: 'msg1', content: 'First message' },
        { ...mockMessage, id: 'msg2', content: 'Second message' },
        { ...mockMessage, id: 'msg3', content: 'Third message' },
      ];

      const result = service.formatMessagesForAI(messages);

      expect(result[0].content).toBe('First message');
      expect(result[1].content).toBe('Second message');
      expect(result[2].content).toBe('Third message');
    });
  });

  describe('createSystemMessage', () => {
    it('should create system message with correct format', () => {
      const content = 'You are a helpful assistant';

      const result = service.createSystemMessage(content);

      expect(result.role).toBe('system');
      expect(result.content).toBe(content);
      expect(result.id).toMatch(
        /^system-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it('should create unique IDs for system messages', () => {
      const message1 = service.createSystemMessage('First message');
      const message2 = service.createSystemMessage('Second message');

      expect(message1.id).not.toBe(message2.id);
    });
  });

  describe('prepareConversationContext', () => {
    it('should prepare context with system prompt', () => {
      const messages: Message[] = [
        { ...mockMessage, id: 'msg1', type: 'user', content: 'Hello' },
        { ...mockMessage, id: 'msg2', type: 'assistant', content: 'Hi there' },
      ];
      const systemPrompt = 'You are a helpful assistant';

      const result = service.prepareConversationContext(messages, systemPrompt);

      expect(result).toHaveLength(3);
      expect(result[0].role).toBe('system');
      expect(result[0].content).toBe(systemPrompt);
      expect(result[1].role).toBe('user');
      expect(result[1].content).toBe('Hello');
      expect(result[2].role).toBe('assistant');
      expect(result[2].content).toBe('Hi there');
    });

    it('should prepare context without system prompt', () => {
      const messages: Message[] = [{ ...mockMessage, id: 'msg1', type: 'user', content: 'Hello' }];

      const result = service.prepareConversationContext(messages);

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('user');
      expect(result[0].content).toBe('Hello');
    });

    it('should handle empty messages with system prompt', () => {
      const systemPrompt = 'You are a helpful assistant';

      const result = service.prepareConversationContext([], systemPrompt);

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('system');
      expect(result[0].content).toBe(systemPrompt);
    });

    it('should handle empty messages without system prompt', () => {
      const result = service.prepareConversationContext([]);

      expect(result).toEqual([]);
    });
  });
});
