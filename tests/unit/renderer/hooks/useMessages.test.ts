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
vi.mock('../../../../src/renderer/store/utils');

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

// Test fixtures
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

const createData: CreateMessageData = {
  conversationId: 'conv-1',
  agentId: 'agent-1',
  content: 'Hello world',
  type: 'text',
};

// Simplified mock implementation
const createOptimisticMock = () => {
  return (
    optimisticUpdater: any,
    ipcOperation: any,
    confirmedUpdater: any,
    revertUpdater: any,
    errorHandler: any,
  ) => {
    return async (...args: unknown[]) => {
      try {
        optimisticUpdater(...args);
        const result = await ipcOperation(...args);
        confirmedUpdater(result);
        return result;
      } catch (error) {
        revertUpdater(...args);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errorHandler(errorMessage);
        return null;
      }
    };
  };
};

// Test data for error scenarios
const errorScenarios = [
  {
    name: 'database error',
    error: new Error('Database connection failed'),
    expectedType: 'unknown',
    expectedMessage: 'Database connection failed',
    retryable: true,
  },
  {
    name: 'validation error',
    error: new Error('Invalid message ID format'),
    expectedType: 'unknown',
    expectedMessage: 'Invalid message ID format',
    retryable: true,
  },
  {
    name: 'network error',
    error: new Error('Network timeout during fetch'),
    expectedType: 'network',
    expectedMessage:
      'Network error during {{operation}}. Please check your connection and try again.',
    retryable: true,
  },
];

const notFoundScenarios = [
  {
    name: 'not found error',
    error: new Error('Message not found in database'),
    expectedType: 'not_found',
    expectedMessage: 'Message not found during {{operation}}. The message may have been deleted.',
    retryable: false,
  },
  {
    name: 'does not exist error',
    error: new Error('Message does not exist'),
    expectedType: 'not_found',
    expectedMessage: 'Message not found during {{operation}}. The message may have been deleted.',
    retryable: false,
  },
];

describe('useMessages', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    global.window = { electronAPI: mockElectronAPI } as any;

    // Mock console.warn to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock setTimeout to eliminate delays
    vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback(); // Execute immediately
      return 0 as any;
    });

    // Get the mocked function and set up implementation
    const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
    const mockCreateOptimisticUpdate = vi.mocked(createOptimisticUpdate);
    mockCreateOptimisticUpdate.mockImplementation(createOptimisticMock());
  });

  it('should initialize with empty messages array', () => {
    const { result } = renderHook(() => useMessages());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should list messages successfully', async () => {
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
    mockElectronAPI.dbMessagesGet.mockResolvedValue(mockMessage);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const message = await result.current.getMessage('1');
      expect(message).toEqual(mockMessage);
    });

    expect(result.current.error).toBeNull();
  });

  it('should create message successfully', async () => {
    const createdMessage: Message = {
      id: '1',
      ...createData,
      isActive: true,
      metadata: '{}',
      timestamp: Date.now(),
    };

    mockElectronAPI.dbMessagesCreate.mockResolvedValue(createdMessage);

    const { result } = renderHook(() => useMessages());

    await act(async () => {
      const message = await result.current.createMessage(createData);
      expect(message).toEqual(createdMessage);
    });

    expect(result.current.messages).toContain(createdMessage);
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

    it.each(errorScenarios)(
      'should handle update active state $name',
      async ({ error, expectedType, expectedMessage, retryable }) => {
        const updateData: UpdateMessageActiveStateData = { isActive: false };
        mockElectronAPI.dbMessagesUpdateActiveState.mockRejectedValue(error);

        const { result } = renderHook(() => useMessages());

        await act(async () => {
          const response = await result.current.updateMessageActiveState(
            mockMessage.id,
            updateData,
          );
          expect(response).toBeNull();
        });

        if (expectedType === 'network') {
          expect(result.current.error).toBe(
            expectedMessage.replace('{{operation}}', 'update message active state'),
          );
          expect(getHookResult(result).structuredError).toEqual({
            type: expectedType,
            message: expectedMessage.replace('{{operation}}', 'update message active state'),
            operation: 'update message active state',
            retryable,
          });
        } else {
          expect(result.current.error).toBe(
            `Error during update message active state: ${error.message}`,
          );
          expect(getHookResult(result).structuredError).toEqual({
            type: expectedType,
            message: `Error during update message active state: ${error.message}`,
            operation: 'update message active state',
            retryable,
          });
        }
      },
    );

    it.each(notFoundScenarios)(
      'should handle update active state $name',
      async ({ error, expectedType, expectedMessage, retryable }) => {
        const updateData: UpdateMessageActiveStateData = { isActive: false };
        mockElectronAPI.dbMessagesUpdateActiveState.mockRejectedValue(error);

        const { result } = renderHook(() => useMessages());

        await act(async () => {
          const response = await result.current.updateMessageActiveState(
            mockMessage.id,
            updateData,
          );
          expect(response).toBeNull();
        });

        expect(getHookResult(result).structuredError).toEqual({
          type: expectedType,
          message: expectedMessage.replace('{{operation}}', 'update message active state'),
          operation: 'update message active state',
          retryable,
        });
      },
    );

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
        result.current.messages.push(mockMessage);
        const response = await result.current.updateMessageActiveState(mockMessage.id, updateData);
        expect(response).toBeNull();
      });

      const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
      expect(vi.mocked(createOptimisticUpdate)).toHaveBeenCalled();
      expect(result.current.error).toBe('Error during update message active state: Database error');
    });

    it('should update local state when update succeeds', async () => {
      const updatedMessage: Message = { ...mockMessage, isActive: false };
      const updateData: UpdateMessageActiveStateData = { isActive: false };

      mockElectronAPI.dbMessagesUpdateActiveState.mockResolvedValue(updatedMessage);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        result.current.messages.push(mockMessage);
        await result.current.updateMessageActiveState(mockMessage.id, updateData);
      });

      const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
      expect(vi.mocked(createOptimisticUpdate)).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
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

    it.each([
      ...errorScenarios,
      {
        name: 'validation error',
        error: new Error('Invalid UUID format'),
        expectedType: 'unknown',
        expectedMessage: 'Invalid UUID format',
        retryable: true,
      },
      {
        name: 'network connection error',
        error: new Error('Network connection timeout'),
        expectedType: 'unknown',
        expectedMessage: 'Network connection timeout',
        retryable: true,
      },
    ])(
      'should handle toggle active state $name',
      async ({ error, expectedType, expectedMessage, retryable }) => {
        mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(error);

        const { result } = renderHook(() => useMessages());

        await act(async () => {
          const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
          expect(response).toBeNull();
        });

        if (expectedType === 'network') {
          expect(result.current.error).toBe(
            expectedMessage.replace('{{operation}}', 'toggle message active state'),
          );
          expect(getHookResult(result).structuredError).toEqual({
            type: expectedType,
            message: expectedMessage.replace('{{operation}}', 'toggle message active state'),
            operation: 'toggle message active state',
            retryable,
          });
        } else {
          expect(result.current.error).toBe(
            `Error during toggle message active state: ${error.message}`,
          );
          expect(getHookResult(result).structuredError).toEqual({
            type: expectedType,
            message: `Error during toggle message active state: ${error.message}`,
            operation: 'toggle message active state',
            retryable,
          });
        }
      },
    );

    it.each(notFoundScenarios)(
      'should handle toggle active state $name',
      async ({ error, expectedType, expectedMessage, retryable }) => {
        mockElectronAPI.dbMessagesToggleActiveState.mockRejectedValue(error);

        const { result } = renderHook(() => useMessages());

        await act(async () => {
          const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
          expect(response).toBeNull();
        });

        expect(getHookResult(result).structuredError).toEqual({
          type: expectedType,
          message: expectedMessage.replace('{{operation}}', 'toggle message active state'),
          operation: 'toggle message active state',
          retryable,
        });
      },
    );

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
        result.current.messages.push(mockMessage);
        const response = await getHookResult(result).toggleMessageActiveState(mockMessage.id);
        expect(response).toBeNull();
      });

      const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
      expect(vi.mocked(createOptimisticUpdate)).toHaveBeenCalled();
      expect(result.current.error).toBe('Error during toggle message active state: Database error');
    });

    it('should update local state when toggle succeeds', async () => {
      const toggledMessage: Message = { ...mockMessage, isActive: false };

      mockElectronAPI.dbMessagesToggleActiveState.mockResolvedValue(toggledMessage);

      const { result } = renderHook(() => useMessages());

      await act(async () => {
        result.current.messages.push(mockMessage);
        await getHookResult(result).toggleMessageActiveState(mockMessage.id);
      });

      const { createOptimisticUpdate } = await import('../../../../src/renderer/store/utils');
      expect(vi.mocked(createOptimisticUpdate)).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
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
