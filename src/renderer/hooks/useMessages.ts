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

  // Enhanced state consistency validation
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

        // Check if all relevant fields match
        return (
          remoteMessage.isActive === localMessage.isActive &&
          remoteMessage.content === localMessage.content &&
          remoteMessage.type === localMessage.type &&
          remoteMessage.metadata === localMessage.metadata
        );
      } catch {
        return false;
      }
    },
    [messages],
  );

  // Batch consistency validation for multiple messages
  const validateBatchConsistency = useCallback(
    async (messageIds: string[]) => {
      if (!isElectronAPIAvailable()) {
        return { consistent: [], inconsistent: [] };
      }

      const results = await Promise.allSettled(
        messageIds.map(async id => {
          const isConsistent = await validateMessageConsistency(id);
          return { id, isConsistent };
        }),
      );

      const consistent: string[] = [];
      const inconsistent: string[] = [];

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          if (result.value.isConsistent) {
            consistent.push(result.value.id);
          } else {
            inconsistent.push(result.value.id);
          }
        } else {
          inconsistent.push('unknown');
        }
      });

      return { consistent, inconsistent };
    },
    [validateMessageConsistency],
  );

  // Enhanced sync message state with better error handling
  const syncMessageState = useCallback(
    async (messageId: string) => {
      if (!isElectronAPIAvailable()) {
        return null;
      }

      try {
        const remoteMessage = await window.electronAPI.dbMessagesGet(messageId);

        if (remoteMessage) {
          setMessages(prev => prev.map(msg => (msg.id === messageId ? remoteMessage : msg)));
          return remoteMessage;
        } else {
          // Message not found in remote, remove from local state
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
          return null;
        }
      } catch (error) {
        handleError(error, 'sync message state');
        return null;
      }
    },
    [handleError],
  );

  // Batch sync multiple messages
  const syncBatchMessageState = useCallback(
    async (messageIds: string[]) => {
      if (!isElectronAPIAvailable()) {
        return { synced: [], failed: [] };
      }

      const results = await Promise.allSettled(
        messageIds.map(async id => {
          const syncedMessage = await syncMessageState(id);
          return { id, message: syncedMessage };
        }),
      );

      const synced: string[] = [];
      const failed: string[] = [];

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.message) {
          synced.push(result.value.id);
        } else {
          failed.push(result.status === 'fulfilled' ? result.value.id : 'unknown');
        }
      });

      return { synced, failed };
    },
    [syncMessageState],
  );

  // Automatic consistency validation and recovery
  const ensureConsistency = useCallback(
    async (messageId: string) => {
      if (!isElectronAPIAvailable()) {
        return false;
      }

      try {
        // First validate consistency
        const isConsistent = await validateMessageConsistency(messageId);

        if (!isConsistent) {
          // If inconsistent, attempt to sync from remote
          const syncedMessage = await syncMessageState(messageId);

          if (syncedMessage) {
            // Revalidate after sync
            return await validateMessageConsistency(messageId);
          }

          return false;
        }

        return true;
      } catch (error) {
        handleError(error, 'ensure consistency');
        return false;
      }
    },
    [validateMessageConsistency, syncMessageState, handleError],
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

          // Validate consistency after successful update (non-blocking)
          setTimeout(() => {
            ensureConsistency(id)
              .then(isConsistent => {
                if (!isConsistent) {
                  console.warn(`Consistency validation failed for message ${id} after update`);
                }
              })
              .catch(error => {
                console.warn(`Consistency validation error for message ${id}:`, error);
              });
          }, 100); // Small delay to ensure UI updates complete
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
    [handleError, clearError, ensureConsistency],
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

          // Validate consistency after successful update (non-blocking)
          setTimeout(() => {
            ensureConsistency(id)
              .then(isConsistent => {
                if (!isConsistent) {
                  console.warn(`Consistency validation failed for message ${id} after update`);
                }
              })
              .catch(error => {
                console.warn(`Consistency validation error for message ${id}:`, error);
              });
          }, 100); // Small delay to ensure UI updates complete
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
    [handleError, clearError, ensureConsistency],
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
    validateBatchConsistency,
    syncMessageState,
    syncBatchMessageState,
    ensureConsistency,
  };
};
