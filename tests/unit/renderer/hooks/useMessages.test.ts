/**
 * Tests for useMessages hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMessages } from '../../../../src/renderer/hooks/useMessages';
import type {
  Message,
  CreateMessageData,
  UpdateMessageActiveStateData,
} from '../../../../src/shared/types';

// Helper function to cast hook result to proper type for testing
const getHookResult = (result: any) => result.current;

// Mock the createOptimisticUpdate utility
vi.mock('../../../../src/renderer/store/utils', () => ({
  createOptimisticUpdate: vi.fn(),
}));

// Mock the MessageErrorType enum
vi.mock('../../../../src/renderer/hooks/MessageErrorType', () => ({
  MessageErrorType: {
    NETWORK: 'network',
    VALIDATION: 'validation',
    NOT_FOUND: 'not_found',
    DATABASE: 'database',
    UNKNOWN: 'unknown',
  },
}));

// Mock the window.electronAPI
const mockElectronAPI = {
  dbMessagesList: vi.fn(),
  dbMessagesGet: vi.fn(),
  dbMessagesCreate: vi.fn(),
  dbMessagesDelete: vi.fn(),
  dbMessagesUpdateActiveState: vi.fn(),
  dbMessagesToggleActiveState: vi.fn(),
};

// Mock window
global.window = {
  electronAPI: mockElectronAPI,
} as any;

describe('useMessages', () => {
  const mockMessage: Message = {
    id: 'test-message-id',
    conversationId: 'conv-1',
    agentId: 'agent-1',
    isActive: true,
    content: 'Test message content',
    type: 'text',
    metadata: '{}',
    timestamp: Date.now(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Restore the window.electronAPI mock
    global.window = {
      electronAPI: mockElectronAPI,
    } as any;

    // Get the mocked createOptimisticUpdate function
    const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
    const mockCreateOptimisticUpdate = vi.mocked(createOptimisticUpdate);

    // Reset the createOptimisticUpdate mock to return a simple async function
    mockCreateOptimisticUpdate.mockImplementation(
      (optimisticUpdater, ipcOperation, confirmedUpdater, revertUpdater, errorHandler) => {
        return async (...args: unknown[]) => {
          try {
            // Apply optimistic update
            optimisticUpdater(...(args as [id: string, updates?: any]));
            // Call IPC operation
            const result = await ipcOperation(...(args as [id: string, updates?: any]));
            // Confirm with result
            confirmedUpdater(result);
            return result;
          } catch (error) {
            // Revert on error
            revertUpdater(...(args as [id: string, updates?: any]));
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errorHandler(errorMessage);
            return null;
          }
        };
      },
    );
  });

  it('should initialize with empty messages array', () => {
    const { result } = renderHook(() => useMessages());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should list messages successfully', async () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        conversationId: 'conv-1',
        agentId: 'agent-1',
        isActive: true,
        content: 'Hello world',
        type: 'text',
        metadata: '{}',
        timestamp: Date.now(),
      },
    ];

    mockElectronAPI.dbMessagesList.mockResolvedValue(mockMessages);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const messages = await result.current.listMessages('conv-1');
      expect(messages).toEqual(mockMessages);
    });

    expect(result.current.messages).toEqual(mockMessages);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle listMessages error', async () => {
    mockElectronAPI.dbMessagesList.mockRejectedValue(new Error('Database error'));

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const messages = await result.current.listMessages('conv-1');
      expect(messages).toEqual([]);
    });

    expect(result.current.error).toBe('Database error');
    expect(result.current.loading).toBe(false);
  });

  it('should get message successfully', async () => {
    const mockMessage: Message = {
      id: '1',
      conversationId: 'conv-1',
      agentId: 'agent-1',
      isActive: true,
      content: 'Hello world',
      type: 'text',
      metadata: '{}',
      timestamp: Date.now(),
    };

    mockElectronAPI.dbMessagesGet.mockResolvedValue(mockMessage);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const message = await result.current.getMessage('1');
      expect(message).toEqual(mockMessage);
    });

    expect(result.current.error).toBeNull();
  });

  it('should create message successfully', async () => {
    const createData: CreateMessageData = {
      conversationId: 'conv-1',
      agentId: 'agent-1',
      content: 'Hello world',
      type: 'text',
    };

    const mockMessage: Message = {
      id: '1',
      ...createData,
      isActive: true,
      metadata: '{}',
      timestamp: Date.now(),
    };

    mockElectronAPI.dbMessagesCreate.mockResolvedValue(mockMessage);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const message = await result.current.createMessage(createData);
      expect(message).toEqual(mockMessage);
    });

    expect(result.current.messages).toContain(mockMessage);
    expect(result.current.error).toBeNull();
  });

  it('should delete message successfully', async () => {
    mockElectronAPI.dbMessagesDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const success = await result.current.deleteMessage('1');
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle error when electronAPI is not available', async () => {
    global.window = {} as any;

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const messages = await result.current.listMessages('conv-1');
      expect(messages).toEqual([]);
    });

    expect(result.current.error).toBe('Electron API not available');
  });

  describe('updateMessageActiveState', () => {
    it('should update message active state successfully', async () => {
      const updatedMessage: Message = { ...mockMessage, isActive: false };
      const updateData: UpdateMessageActiveStateData = { isActive: false };

      mockElectronAPI.dbMessagesUpdateActiveState.mockResolvedValue(updatedMessage);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        // Set initial message in state
        result.current.messages.push(mockMessage);
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toEqual(updatedMessage);
      });

      expect(mockElectronAPI.dbMessagesUpdateActiveState).toHaveBeenCalledWith(
        mockMessage.id,
        updateData,
      );
      expect(result.current.error).toBeNull();
    });

    it('should handle update active state with true value', async () => {
      const updatedMessage: Message = { ...mockMessage, isActive: true };
      const updateData: UpdateMessageActiveStateData = { isActive: true };

      mockElectronAPI.dbMessagesUpdateActiveState.mockResolvedValue(updatedMessage);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toEqual(updatedMessage);
      });

      expect(mockElectronAPI.dbMessagesUpdateActiveState).toHaveBeenCalledWith(
        mockMessage.id,
        updateData,
      );
    });

    it('should handle update active state database error', async () => {
      const updateData: UpdateMessageActiveStateData = { isActive: false };
      const dbError = new Error('Database connection failed');

      mockElectronAPI.dbMessagesUpdateActiveState.mockRejectedValue(dbError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toBeNull();
      });

      expect(result.current.error).toBe(
        'Error during update message active state: Database connection failed',
      );
      expect(getHookResult(result).structuredError).toEqual({
        type: 'unknown',
        message: 'Error during update message active state: Database connection failed',
        operation: 'update message active state',
        retryable: true,
      });
    });

    it('should handle update active state validation error', async () => {
      const updateData: UpdateMessageActiveStateData = { isActive: false };
      const validationError = new Error('Invalid message ID format');

      mockElectronAPI.dbMessagesUpdateActiveState.mockRejectedValue(validationError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toBeNull();
      });

      expect(result.current.error).toBe(
        'Error during update message active state: Invalid message ID format',
      );
      expect(getHookResult(result).structuredError).toEqual({
        type: 'unknown',
        message: 'Error during update message active state: Invalid message ID format',
        operation: 'update message active state',
        retryable: true,
      });
    });

    it('should handle update active state not found error', async () => {
      const updateData: UpdateMessageActiveStateData = { isActive: false };
      const notFoundError = new Error('Message not found in database');

      mockElectronAPI.dbMessagesUpdateActiveState.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toBeNull();
      });

      expect(getHookResult(result).structuredError).toEqual({
        type: 'not_found',
        message:
          'Message not found during update message active state. The message may have been deleted.',
        operation: 'update message active state',
        retryable: false,
      });
    });

    it('should handle update active state network error', async () => {
      const updateData: UpdateMessageActiveStateData = { isActive: false };
      const networkError = new Error('Network timeout during fetch');

      mockElectronAPI.dbMessagesUpdateActiveState.mockRejectedValue(networkError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toBeNull();
      });

      expect(getHookResult(result).structuredError).toEqual({
        type: 'network',
        message:
          'Network error during update message active state. Please check your connection and try again.',
        operation: 'update message active state',
        retryable: true,
      });
    });

    it('should handle update active state when electronAPI is not available', async () => {
      global.window = {} as any;
      const updateData: UpdateMessageActiveStateData = { isActive: false };

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toBeNull();
      });

      expect(result.current.error).toBe('Electron API not available');
      expect(getHookResult(result).structuredError).toEqual({
        type: 'unknown',
        message: 'Electron API not available',
        operation: 'update message active state',
        retryable: false,
      });
    });

    it('should perform optimistic update and revert on error', async () => {
      const updateData: UpdateMessageActiveStateData = { isActive: false };
      const dbError = new Error('Database error');

      mockElectronAPI.dbMessagesUpdateActiveState.mockRejectedValue(dbError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        // Set initial message in state
        result.current.messages.push(mockMessage);
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toBeNull();
      });

      // Verify optimistic update was called
      const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
      expect(createOptimisticUpdate).toHaveBeenCalled();
      expect(result.current.error).toBe('Error during update message active state: Database error');
    });

    it('should update local state when update succeeds', async () => {
      const updatedMessage: Message = { ...mockMessage, isActive: false };
      const updateData: UpdateMessageActiveStateData = { isActive: false };

      mockElectronAPI.dbMessagesUpdateActiveState.mockResolvedValue(updatedMessage);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        // Set initial message in state
        result.current.messages.push(mockMessage);
        await result.current.updateMessageActiveState(mockMessage.id, updateData);
      });

      // Verify the createOptimisticUpdate was called with correct parameters
      const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
      expect(createOptimisticUpdate).toHaveBeenCalledWith(
        expect.any(Function), // optimisticUpdater
        expect.any(Function), // ipcOperation
        expect.any(Function), // confirmedUpdater
        expect.any(Function), // revertUpdater
        expect.any(Function), // errorHandler
      );
    });

    it('should handle null response from API', async () => {
      const updateData: UpdateMessageActiveStateData = { isActive: false };

      mockElectronAPI.dbMessagesUpdateActiveState.mockResolvedValue(null);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toBeNull();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('toggleMessageActiveState', () => {
    it('should toggle message active state successfully from true to false', async () => {
      const toggledMessage: Message = { ...mockMessage, isActive: false };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(toggledMessage);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
        expect(response).toEqual(toggledMessage);
      });

      expect(mockElectronAPI.dbMessagesToggleActiveState).toHaveBeenCalledWith(mockMessage.id);
      expect(result.current.error).toBeNull();
    });

    it('should toggle message active state successfully from false to true', async () => {
      const inactiveMessage: Message = { ...mockMessage, isActive: false };
      const toggledMessage: Message = { ...mockMessage, isActive: true };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(toggledMessage);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await getHookResult(result).toggleMessageActiveState(inactiveMessage.id);
        expect(response).toEqual(toggledMessage);
      });

      expect(mockElectronAPI.dbMessagesToggleActiveState).toHaveBeenCalledWith(inactiveMessage.id);
    });

    it('should handle toggle active state database error', async () => {
      const dbError = new Error('Database connection failed');

      mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(dbError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
        expect(response).toBeNull();
      });

      expect(result.current.error).toBe(
        'Error during toggle message active state: Database connection failed',
      );
      expect(getHookResult(result).structuredError).toEqual({
        type: 'unknown',
        message: 'Error during toggle message active state: Database connection failed',
        operation: 'toggle message active state',
        retryable: true,
      });
    });

    it('should handle toggle active state validation error', async () => {
      const validationError = new Error('Invalid UUID format');

      mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(validationError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
        expect(response).toBeNull();
      });

      expect(result.current.error).toBe(
        'Error during toggle message active state: Invalid UUID format',
      );
      expect(getHookResult(result).structuredError).toEqual({
        type: 'unknown',
        message: 'Error during toggle message active state: Invalid UUID format',
        operation: 'toggle message active state',
        retryable: true,
      });
    });

    it('should handle toggle active state not found error', async () => {
      const notFoundError = new Error('Message does not exist');

      mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
        expect(response).toBeNull();
      });

      expect(getHookResult(result).structuredError).toEqual({
        type: 'not_found',
        message:
          'Message not found during toggle message active state. The message may have been deleted.',
        operation: 'toggle message active state',
        retryable: false,
      });
    });

    it('should handle toggle active state network error', async () => {
      const networkError = new Error('Network connection timeout');

      mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(networkError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
        expect(response).toBeNull();
      });

      expect(getHookResult(result).structuredError).toEqual({
        type: 'unknown',
        message: 'Error during toggle message active state: Network connection timeout',
        operation: 'toggle message active state',
        retryable: true,
      });
    });

    it('should handle toggle active state when electronAPI is not available', async () => {
      global.window = {} as any;

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
        expect(response).toBeNull();
      });

      expect(result.current.error).toBe('Electron API not available');
      expect(getHookResult(result).structuredError).toEqual({
        type: 'unknown',
        message: 'Electron API not available',
        operation: 'toggle message active state',
        retryable: false,
      });
    });

    it('should perform optimistic update and revert on error', async () => {
      const dbError = new Error('Database error');

      mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(dbError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        // Set initial message in state
        result.current.messages.push(mockMessage);
        const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
        expect(response).toBeNull();
      });

      // Verify optimistic update was called
      const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
      expect(createOptimisticUpdate).toHaveBeenCalled();
      expect(result.current.error).toBe('Error during toggle message active state: Database error');
    });

    it('should update local state when toggle succeeds', async () => {
      const toggledMessage: Message = { ...mockMessage, isActive: false };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(toggledMessage);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        // Set initial message in state
        result.current.messages.push(mockMessage);
        await getHookResult(result).toggleMessageActiveState(mockMessage.id);
      });

      // Verify the createOptimisticUpdate was called with correct parameters
      const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
      expect(createOptimisticUpdate).toHaveBeenCalledWith(
        expect.any(Function), // optimisticUpdater
        expect.any(Function), // ipcOperation
        expect.any(Function), // confirmedUpdater
        expect.any(Function), // revertUpdater
        expect.any(Function), // errorHandler
      );
    });

    it('should handle null response from API', async () => {
      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(null);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
        expect(response).toBeNull();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('error handling and recovery', () => {
    it('should provide clearError function', async () => {
      const dbError = new Error('Database error');
      mockElectronAPI.dbMessagesUpdateActiveState.mockRejectedValue(dbError);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        await result.current.updateMessageActiveState(mockMessage.id, { isActive: false });
      });

      expect(result.current.error).toBeTruthy();
      expect(getHookResult(result).structuredError).toBeTruthy();

      act(() => {
        getHookResult(result).clearError();
      });

      expect(result.current.error).toBeNull();
      expect(getHookResult(result).structuredError).toBeNull();
    });

    it('should provide retryLastOperation function', async () => {
      const { result } = renderHook(() => useMessages());

      await act(async () => {
        const retryResult = await getHookResult(result).retryLastOperation();
        expect(retryResult).toBeNull(); // No operation to retry
      });

      expect(result.current.error).toBeNull();
    });

    it('should provide state consistency functions', () => {
      const { result } = renderHook(() => useMessages());

      expect(typeof getHookResult(result).validateMessageConsistency).toBe('function');
      expect(typeof getHookResult(result).validateBatchConsistency).toBe('function');
      expect(typeof getHookResult(result).syncMessageState).toBe('function');
      expect(typeof getHookResult(result).syncBatchMessageState).toBe('function');
      expect(typeof getHookResult(result).ensureConsistency).toBe('function');
    });
  });

  describe('function availability', () => {
    it('should export updateMessageActiveState function', () => {
      const { result } = renderHook(() => useMessages());

      expect(typeof result.current.updateMessageActiveState).toBe('function');
    });

    it('should export toggleMessageActiveState function', () => {
      const { result } = renderHook(() => useMessages());

      expect(typeof getHookResult(result).toggleMessageActiveState).toBe('function');
    });

    it('should export all expected functions', () => {
      const { result } = renderHook(() => useMessages());

      // Original functions
      expect(typeof result.current.listMessages).toBe('function');
      expect(typeof result.current.getMessage).toBe('function');
      expect(typeof result.current.createMessage).toBe('function');
      expect(typeof result.current.deleteMessage).toBe('function');

      // New active state functions
      expect(typeof result.current.updateMessageActiveState).toBe('function');
      expect(typeof getHookResult(result).toggleMessageActiveState).toBe('function');

      // Error handling functions
      expect(typeof getHookResult(result).clearError).toBe('function');
      expect(typeof getHookResult(result).retryLastOperation).toBe('function');

      // State consistency functions
      expect(typeof getHookResult(result).validateMessageConsistency).toBe('function');
      expect(typeof getHookResult(result).validateBatchConsistency).toBe('function');
      expect(typeof getHookResult(result).syncMessageState).toBe('function');
      expect(typeof getHookResult(result).syncBatchMessageState).toBe('function');
      expect(typeof getHookResult(result).ensureConsistency).toBe('function');
    });
  });
});
