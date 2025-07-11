import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationContextService } from '../../../../../src/renderer/services/ai/ConversationContextService';
import { Message } from '../../../../../src/shared/types';
import * as aiUtilsModule from '../../../../../src/shared/utils/ai';

// Mock the AI utils module
vi.mock('../../../../../src/shared/utils/ai', () => ({
  getActiveMessagesForAI: vi.fn(),
}));

describe('ConversationContextService', () => {
  let service: ConversationContextService;
  let mockMessages: Message[];

  beforeEach(() => {
    service = new ConversationContextService();

    // Create mock messages with different active states
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
      {
        id: 'msg3',
        conversationId: 'conv1',
        agentId: 'agent1',
        type: 'user',
        content: 'Active message 2',
        isActive: true,
        metadata: '{}',
        timestamp: Date.now() + 2000,
      },
    ];
  });

  describe('prepareAIContext', () => {
    it('should call getActiveMessagesForAI with provided messages', () => {
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      const expectedActiveMessages = mockMessages.filter(msg => msg.isActive);
      mockGetActiveMessagesForAI.mockReturnValue(expectedActiveMessages);

      const result = service.prepareAIContext(mockMessages);

      expect(mockGetActiveMessagesForAI).toHaveBeenCalledWith(mockMessages);
      expect(result).toEqual(expectedActiveMessages);
    });

    it('should return empty array when no messages provided', () => {
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      mockGetActiveMessagesForAI.mockReturnValue([]);

      const result = service.prepareAIContext([]);

      expect(result).toEqual([]);
      expect(mockGetActiveMessagesForAI).toHaveBeenCalledWith([]);
    });

    it('should return only active messages when mixed active/inactive provided', () => {
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      const expectedActiveMessages = mockMessages.filter(msg => msg.isActive);
      mockGetActiveMessagesForAI.mockReturnValue(expectedActiveMessages);

      const result = service.prepareAIContext(mockMessages);

      expect(result).toHaveLength(2);
      expect(result.every(msg => msg.isActive)).toBe(true);
    });
  });

  describe('prepareAIContextForConversation', () => {
    it('should retrieve messages and filter them for AI context', async () => {
      const mockGetAllMessages = vi.fn().mockResolvedValue(mockMessages);
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      const expectedActiveMessages = mockMessages.filter(msg => msg.isActive);
      mockGetActiveMessagesForAI.mockReturnValue(expectedActiveMessages);

      const result = await service.prepareAIContextForConversation('conv1', mockGetAllMessages);

      expect(mockGetAllMessages).toHaveBeenCalledWith('conv1');
      expect(mockGetActiveMessagesForAI).toHaveBeenCalledWith(mockMessages);
      expect(result).toEqual(expectedActiveMessages);
    });

    it('should handle empty conversation', async () => {
      const mockGetAllMessages = vi.fn().mockResolvedValue([]);
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      mockGetActiveMessagesForAI.mockReturnValue([]);

      const result = await service.prepareAIContextForConversation('conv1', mockGetAllMessages);

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const mockGetAllMessages = vi.fn().mockRejectedValue(new Error('Database error'));

      await expect(
        service.prepareAIContextForConversation('conv1', mockGetAllMessages),
      ).rejects.toThrow('Database error');
    });
  });

  describe('validateFilteredContext', () => {
    it('should return correct validation statistics', () => {
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      const expectedActiveMessages = mockMessages.filter(msg => msg.isActive);
      mockGetActiveMessagesForAI.mockReturnValue(expectedActiveMessages);

      const result = service.validateFilteredContext(mockMessages);

      expect(result).toEqual({
        totalMessages: 3,
        activeMessages: 2,
        inactiveMessages: 1,
        isValid: true,
      });
    });

    it('should return invalid when active messages contain inactive ones', () => {
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      // Mock returning a message with isActive: false (this shouldn't happen normally)
      const invalidActiveMessages = [{ ...mockMessages[0], isActive: false }];
      mockGetActiveMessagesForAI.mockReturnValue(invalidActiveMessages);

      const result = service.validateFilteredContext(mockMessages);

      expect(result.isValid).toBe(false);
    });

    it('should handle empty message array', () => {
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      mockGetActiveMessagesForAI.mockReturnValue([]);

      const result = service.validateFilteredContext([]);

      expect(result).toEqual({
        totalMessages: 0,
        activeMessages: 0,
        inactiveMessages: 0,
        isValid: true,
      });
    });

    it('should handle all active messages', () => {
      const allActiveMessages = mockMessages.map(msg => ({ ...msg, isActive: true }));
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      mockGetActiveMessagesForAI.mockReturnValue(allActiveMessages);

      const result = service.validateFilteredContext(allActiveMessages);

      expect(result).toEqual({
        totalMessages: 3,
        activeMessages: 3,
        inactiveMessages: 0,
        isValid: true,
      });
    });

    it('should handle all inactive messages', () => {
      const allInactiveMessages = mockMessages.map(msg => ({ ...msg, isActive: false }));
      const mockGetActiveMessagesForAI = vi.mocked(aiUtilsModule.getActiveMessagesForAI);
      mockGetActiveMessagesForAI.mockReturnValue([]);

      const result = service.validateFilteredContext(allInactiveMessages);

      expect(result).toEqual({
        totalMessages: 3,
        activeMessages: 0,
        inactiveMessages: 3,
        isValid: true,
      });
    });
  });
});
