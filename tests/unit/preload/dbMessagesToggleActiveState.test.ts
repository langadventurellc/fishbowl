import { describe, it, expect, vi, beforeEach } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../../../src/shared/types';

// Mock window.electronAPI
const mockElectronAPI = {
  dbMessagesToggleActiveState: vi.fn(),
  dbMessagesList: vi.fn(),
  dbMessagesGet: vi.fn(),
  dbMessagesCreate: vi.fn(),
  dbMessagesUpdateActiveState: vi.fn(),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('dbMessagesToggleActiveState Preload API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Method Existence', () => {
    it('should be defined on window.electronAPI', () => {
      expect(window.electronAPI.dbMessagesToggleActiveState).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof window.electronAPI.dbMessagesToggleActiveState).toBe('function');
    });
  });

  describe('Function Signature', () => {
    it('should accept a single string parameter (messageId)', async () => {
      const mockMessage: Message = {
        id: uuidv4(),
        conversationId: uuidv4(),
        agentId: uuidv4(),
        type: 'text',
        content: 'Test message',
        isActive: false,
        timestamp: Date.now(),
        metadata: '',
      };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(mockMessage);

      const result = await window.electronAPI.dbMessagesToggleActiveState(mockMessage.id);

      expect(mockElectronAPI.dbMessagesToggleActiveState).toHaveBeenCalledWith(mockMessage.id);
      expect(mockElectronAPI.dbMessagesToggleActiveState).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMessage);
    });

    it('should return a Promise', () => {
      const messageId = uuidv4();
      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(null);

      const result = window.electronAPI.dbMessagesToggleActiveState(messageId);

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Successful Operations', () => {
    it('should toggle message from active to inactive', async () => {
      const messageId = uuidv4();
      const mockMessage: Message = {
        id: messageId,
        conversationId: uuidv4(),
        agentId: uuidv4(),
        type: 'text',
        content: 'Test message',
        isActive: false, // toggled from true to false
        timestamp: Date.now(),
        metadata: '',
      };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(mockMessage);

      const result = await window.electronAPI.dbMessagesToggleActiveState(messageId);

      expect(result).not.toBeNull();
      expect(result?.isActive).toBe(false);
      expect(result?.id).toBe(messageId);
    });

    it('should toggle message from inactive to active', async () => {
      const messageId = uuidv4();
      const mockMessage: Message = {
        id: messageId,
        conversationId: uuidv4(),
        agentId: uuidv4(),
        type: 'text',
        content: 'Test message',
        isActive: true, // toggled from false to true
        timestamp: Date.now(),
        metadata: '',
      };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(mockMessage);

      const result = await window.electronAPI.dbMessagesToggleActiveState(messageId);

      expect(result).not.toBeNull();
      expect(result?.isActive).toBe(true);
      expect(result?.id).toBe(messageId);
    });

    it('should return proper Message structure', async () => {
      const messageId = uuidv4();
      const mockMessage: Message = {
        id: messageId,
        conversationId: uuidv4(),
        agentId: uuidv4(),
        type: 'text',
        content: 'Test message',
        isActive: true,
        timestamp: Date.now(),
        metadata: '{"edited":true}',
      };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(mockMessage);

      const result = await window.electronAPI.dbMessagesToggleActiveState(messageId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('conversationId');
      expect(result).toHaveProperty('agentId');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('isActive');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('metadata');
    });
  });

  describe('Error Handling', () => {
    it('should return null when message is not found', async () => {
      const messageId = uuidv4();
      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(null);

      const result = await window.electronAPI.dbMessagesToggleActiveState(messageId);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const messageId = uuidv4();
      const dbError = new Error('Database connection failed');
      mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(dbError);

      await expect(window.electronAPI.dbMessagesToggleActiveState(messageId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle validation errors', async () => {
      const invalidId = 'not-a-uuid';
      const validationError = new Error('Invalid UUID format');
      mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(validationError);

      await expect(window.electronAPI.dbMessagesToggleActiveState(invalidId)).rejects.toThrow(
        'Invalid UUID format',
      );
    });

    it('should handle generic errors', async () => {
      const messageId = uuidv4();
      const genericError = new Error('Unexpected error');
      mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(genericError);

      await expect(window.electronAPI.dbMessagesToggleActiveState(messageId)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('Parameter Validation', () => {
    it('should work with valid UUID format', async () => {
      const messageId = uuidv4();
      const mockMessage: Message = {
        id: messageId,
        conversationId: uuidv4(),
        agentId: uuidv4(),
        type: 'text',
        content: 'Test message',
        isActive: true,
        timestamp: Date.now(),
        metadata: '',
      };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(mockMessage);

      const result = await window.electronAPI.dbMessagesToggleActiveState(messageId);

      expect(mockElectronAPI.dbMessagesToggleActiveState).toHaveBeenCalledWith(messageId);
      expect(result).toEqual(mockMessage);
    });

    it('should handle different UUID formats', async () => {
      const upperCaseId = uuidv4().toUpperCase();
      const mockMessage: Message = {
        id: upperCaseId,
        conversationId: uuidv4(),
        agentId: uuidv4(),
        type: 'text',
        content: 'Test message',
        isActive: false,
        timestamp: Date.now(),
        metadata: '',
      };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(mockMessage);

      const result = await window.electronAPI.dbMessagesToggleActiveState(upperCaseId);

      expect(mockElectronAPI.dbMessagesToggleActiveState).toHaveBeenCalledWith(upperCaseId);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('Integration with Other Message Operations', () => {
    it('should be consistent with other message API methods', () => {
      // Verify that toggle method exists alongside other message methods
      expect(window.electronAPI.dbMessagesToggleActiveState).toBeDefined();
      expect(window.electronAPI.dbMessagesUpdateActiveState).toBeDefined();
      expect(window.electronAPI.dbMessagesGet).toBeDefined();
      expect(window.electronAPI.dbMessagesList).toBeDefined();
      expect(window.electronAPI.dbMessagesCreate).toBeDefined();
    });

    it('should follow the same async pattern as other message operations', async () => {
      const messageId = uuidv4();
      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(null);

      const togglePromise = window.electronAPI.dbMessagesToggleActiveState(messageId);

      expect(togglePromise).toBeInstanceOf(Promise);

      const result = await togglePromise;
      expect(result).toBeNull();
    });

    it('should handle the same error types as other message operations', async () => {
      const messageId = uuidv4();
      const error = new Error('Database error');
      mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(error);

      await expect(window.electronAPI.dbMessagesToggleActiveState(messageId)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
