/**
 * React hook for message database operations
 * Note: Messages are not currently part of the Zustand store architecture.
 * This hook maintains local state management for message operations.
 */

import { useCallback, useState, useRef } from 'react';
import type {
  Message,
  DatabaseFilter,
  CreateMessageData,
  UpdateMessageActiveStateData,
} from '../../shared/types';
import { createOptimisticUpdate } from '../store/utils';
import { MessageErrorType } from './MessageErrorType';
import type { MessageError } from './MessageError';

interface RetryableOperation {
  operation: () => Promise<Message | null>;
  operationName: string;
  attempts: number;
  maxAttempts: number;
}

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Error categorization helper
const categorizeError = (error: unknown, operation: string): MessageError => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      type: MessageErrorType.NETWORK,
      message: `Network error during ${operation}. Please check your connection and try again.`,
      operation,
      retryable: true,
    };
  }

  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return {
      type: MessageErrorType.VALIDATION,
      message: `Validation error during ${operation}. Please check your input and try again.`,
      operation,
      retryable: false,
    };
  }

  if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
    return {
      type: MessageErrorType.NOT_FOUND,
      message: `Message not found during ${operation}. The message may have been deleted.`,
      operation,
      retryable: false,
    };
  }

  if (errorMessage.includes('database') || errorMessage.includes('sqlite')) {
    return {
      type: MessageErrorType.DATABASE,
      message: `Database error during ${operation}. Please try again.`,
      operation,
      retryable: true,
    };
  }

  return {
    type: MessageErrorType.UNKNOWN,
    message: `Error during ${operation}: ${errorMessage}`,
    operation,
    retryable: true,
  };
};

// Retry logic with exponential backoff
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Hook for messages operations
export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [structuredError, setStructuredError] = useState<MessageError | null>(null);
  const lastFailedOperation = useRef<RetryableOperation | null>(null);

  // Enhanced error handler
  const handleError = useCallback((error: unknown, operation: string) => {
    const categorizedError = categorizeError(error, operation);
    setError(categorizedError.message);
    setStructuredError(categorizedError);
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    setStructuredError(null);
    lastFailedOperation.current = null;
  }, []);

  // Retry the last failed operation
  const retryLastOperation = useCallback(async () => {
    if (!lastFailedOperation.current) {
      return null;
    }

    const operation = lastFailedOperation.current;

    // Don't retry if max attempts reached
    if (operation.attempts >= operation.maxAttempts) {
      return null;
    }

    try {
      setLoading(true);
      clearError();

      // Increment attempts
      operation.attempts += 1;

      const result = await operation.operation();

      // Clear the failed operation on success
      lastFailedOperation.current = null;

      return result;
    } catch (error) {
      handleError(error, operation.operationName);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  // State consistency validation
  const validateMessageConsistency = useCallback(
    async (messageId: string) => {
      if (!isElectronAPIAvailable()) {
        return false;
      }

      try {
        const remoteMessage = await window.electronAPI.dbMessagesGet(messageId);
        const localMessage = messages.find(msg => msg.id === messageId);

        if (!remoteMessage || !localMessage) {
          return false;
        }

        // Check if active state matches
        return remoteMessage.isActive === localMessage.isActive;
      } catch {
        return false;
      }
    },
    [messages],
  );

  // Sync message state with remote
  const syncMessageState = useCallback(
    async (messageId: string) => {
      if (!isElectronAPIAvailable()) {
        return null;
      }

      try {
        const remoteMessage = await window.electronAPI.dbMessagesGet(messageId);

        if (remoteMessage) {
          setMessages(prev => prev.map(msg => (msg.id === messageId ? remoteMessage : msg)));
        }

        return remoteMessage;
      } catch (error) {
        handleError(error, 'sync message state');
        return null;
      }
    },
    [handleError],
  );

  const listMessages = useCallback(async (conversationId: string, filter?: DatabaseFilter) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbMessagesList(conversationId, filter);
      setMessages(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list messages';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getMessage = useCallback(async (id: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      return await window.electronAPI.dbMessagesGet(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get message';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMessage = useCallback(async (messageData: CreateMessageData) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.dbMessagesCreate(messageData);
      setMessages(prev => [...prev, result]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create message';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await window.electronAPI.dbMessagesDelete(id);
      setMessages(prev => prev.filter(msg => msg.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMessageActiveState = useCallback(
    async (id: string, updates: UpdateMessageActiveStateData) => {
      if (!isElectronAPIAvailable()) {
        const errorMsg = 'Electron API not available';
        setError(errorMsg);
        setStructuredError({
          type: MessageErrorType.UNKNOWN,
          message: errorMsg,
          operation: 'update message active state',
          retryable: false,
        });
        return null;
      }

      setLoading(true);
      clearError();

      // Store original state for potential rollback
      let originalMessage: Message | null = null;

      const optimisticUpdater = () => {
        setMessages(prev => {
          const messageIndex = prev.findIndex(msg => msg.id === id);
          if (messageIndex === -1) return prev;

          originalMessage = prev[messageIndex];
          return prev.map(msg => (msg.id === id ? { ...msg, isActive: updates.isActive } : msg));
        });
      };

      const ipcOperation = async () => {
        return await retryOperation(
          () => window.electronAPI.dbMessagesUpdateActiveState(id, updates),
          3,
          1000,
        );
      };

      const confirmedUpdater = (result: Message | null) => {
        if (result) {
          setMessages(prev => prev.map(msg => (msg.id === id ? result : msg)));
        }
        setLoading(false);
      };

      const revertUpdater = () => {
        if (originalMessage) {
          const messageToRevert = originalMessage;
          setMessages(prev => prev.map(msg => (msg.id === id ? messageToRevert : msg)));
        }
        setLoading(false);
      };

      const errorHandler = (errorMessage: string) => {
        const error = new Error(errorMessage);
        handleError(error, 'update message active state');

        // Store the failed operation for retry
        lastFailedOperation.current = {
          operation: async () => {
            const result = await window.electronAPI.dbMessagesUpdateActiveState(id, updates);
            if (result) {
              setMessages(prev => prev.map(msg => (msg.id === id ? result : msg)));
            }
            return result;
          },
          operationName: 'update message active state',
          attempts: 1,
          maxAttempts: 3,
        };
      };

      const optimisticOperation = createOptimisticUpdate(
        optimisticUpdater,
        ipcOperation,
        confirmedUpdater,
        revertUpdater,
        errorHandler,
      );

      return await optimisticOperation();
    },
    [handleError, clearError],
  );

  const toggleMessageActiveState = useCallback(
    async (id: string) => {
      if (!isElectronAPIAvailable()) {
        const errorMsg = 'Electron API not available';
        setError(errorMsg);
        setStructuredError({
          type: MessageErrorType.UNKNOWN,
          message: errorMsg,
          operation: 'toggle message active state',
          retryable: false,
        });
        return null;
      }

      setLoading(true);
      clearError();

      // Store original state for potential rollback
      let originalMessage: Message | null = null;

      const optimisticUpdater = () => {
        setMessages(prev => {
          const messageIndex = prev.findIndex(msg => msg.id === id);
          if (messageIndex === -1) return prev;

          originalMessage = prev[messageIndex];
          return prev.map(msg => (msg.id === id ? { ...msg, isActive: !msg.isActive } : msg));
        });
      };

      const ipcOperation = async () => {
        return await retryOperation(
          () => window.electronAPI.dbMessagesToggleActiveState(id),
          3,
          1000,
        );
      };

      const confirmedUpdater = (result: Message | null) => {
        if (result) {
          setMessages(prev => prev.map(msg => (msg.id === id ? result : msg)));
        }
        setLoading(false);
      };

      const revertUpdater = () => {
        if (originalMessage) {
          const messageToRevert = originalMessage;
          setMessages(prev => prev.map(msg => (msg.id === id ? messageToRevert : msg)));
        }
        setLoading(false);
      };

      const errorHandler = (errorMessage: string) => {
        const error = new Error(errorMessage);
        handleError(error, 'toggle message active state');

        // Store the failed operation for retry
        lastFailedOperation.current = {
          operation: async () => {
            const result = await window.electronAPI.dbMessagesToggleActiveState(id);
            if (result) {
              setMessages(prev => prev.map(msg => (msg.id === id ? result : msg)));
            }
            return result;
          },
          operationName: 'toggle message active state',
          attempts: 1,
          maxAttempts: 3,
        };
      };

      const optimisticOperation = createOptimisticUpdate(
        optimisticUpdater,
        ipcOperation,
        confirmedUpdater,
        revertUpdater,
        errorHandler,
      );

      return await optimisticOperation();
    },
    [handleError, clearError],
  );

  return {
    messages,
    loading,
    error,
    structuredError,
    listMessages,
    getMessage,
    createMessage,
    deleteMessage,
    updateMessageActiveState,
    toggleMessageActiveState,
    clearError,
    retryLastOperation,
    validateMessageConsistency,
    syncMessageState,
  };
};
