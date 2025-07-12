import { describe, it, expect, beforeEach } from 'vitest';
import { MessageActiveStateError } from '../../../../../src/renderer/utils/database/MessageActiveStateError';
import { MessageActiveStateErrorType } from '../../../../../src/renderer/utils/database/MessageActiveStateErrorType';
import { type MessageActiveStateContext } from '../../../../../src/renderer/utils/database/MessageActiveStateContext';
import { DatabaseErrorType } from '../../../../../src/renderer/utils/database/DatabaseErrorType';
import { DatabaseErrorSeverity } from '../../../../../src/renderer/utils/database/DatabaseErrorSeverity';
import { v4 as uuidv4 } from 'uuid';

describe('MessageActiveStateError', () => {
  let mockMessageId: string;
  let mockConversationId: string;
  let mockAgentId: string;

  beforeEach(() => {
    mockMessageId = uuidv4();
    mockConversationId = uuidv4();
    mockAgentId = uuidv4();
  });

  describe('constructor', () => {
    it('should create error with all provided values', () => {
      const context: MessageActiveStateContext = {
        messageId: mockMessageId,
        operation: 'toggle',
        currentState: true,
        targetState: false,
      };

      const originalError = new Error('Database error');
      const error = new MessageActiveStateError(
        MessageActiveStateErrorType.TOGGLE_FAILED,
        context,
        'Custom message',
        originalError,
        DatabaseErrorSeverity.HIGH,
      );

      expect(error.name).toBe('MessageActiveStateError');
      expect(error.activeStateType).toBe(MessageActiveStateErrorType.TOGGLE_FAILED);
      expect(error.context).toEqual(context);
      expect(error.message).toBe('Custom message');
      expect(error.code).toBe('message-active-state-toggle-toggle_failed');
      expect(error.severity).toBe(DatabaseErrorSeverity.HIGH);
    });

    it('should use default severity when not provided', () => {
      const context: MessageActiveStateContext = {
        messageId: mockMessageId,
        operation: 'update',
      };

      const error = new MessageActiveStateError(MessageActiveStateErrorType.UPDATE_FAILED, context);

      expect(error.severity).toBe(DatabaseErrorSeverity.MEDIUM);
    });

    it('should generate user-friendly message when none provided', () => {
      const context: MessageActiveStateContext = {
        messageId: mockMessageId,
        operation: 'toggle',
      };

      const error = new MessageActiveStateError(MessageActiveStateErrorType.TOGGLE_FAILED, context);

      expect(error.message).toBe('Failed to toggle message active state. Please try again.');
    });

    it('should properly map to database error types', () => {
      const testCases = [
        {
          type: MessageActiveStateErrorType.INVALID_STATE_VALUE,
          expected: DatabaseErrorType.VALIDATION,
        },
        {
          type: MessageActiveStateErrorType.MESSAGE_NOT_FOUND,
          expected: DatabaseErrorType.NOT_FOUND,
        },
        {
          type: MessageActiveStateErrorType.PERMISSION_DENIED,
          expected: DatabaseErrorType.PERMISSION,
        },
        {
          type: MessageActiveStateErrorType.TRANSACTION_FAILED,
          expected: DatabaseErrorType.CONFLICT,
        },
        {
          type: MessageActiveStateErrorType.CONSISTENCY_ERROR,
          expected: DatabaseErrorType.CONFLICT,
        },
        { type: MessageActiveStateErrorType.TOGGLE_FAILED, expected: DatabaseErrorType.UNKNOWN },
        { type: MessageActiveStateErrorType.UPDATE_FAILED, expected: DatabaseErrorType.UNKNOWN },
      ];

      testCases.forEach(({ type, expected }) => {
        const context: MessageActiveStateContext = {
          messageId: mockMessageId,
          operation: 'toggle',
        };

        const error = new MessageActiveStateError(type, context);
        expect(error.type).toBe(expected);
      });
    });

    it('should include comprehensive metadata in details', () => {
      const context: MessageActiveStateContext = {
        messageId: mockMessageId,
        operation: 'sync',
        currentState: true,
        targetState: false,
        conversationId: mockConversationId,
        agentId: mockAgentId,
      };

      const originalError = new Error('Connection timeout');
      originalError.stack = 'Error: Connection timeout\n    at test:1:1';

      const error = new MessageActiveStateError(
        MessageActiveStateErrorType.CONSISTENCY_ERROR,
        context,
        'Sync failed',
        originalError,
      );

      expect(error.technicalDetails).toEqual({
        operation: 'sync',
        table: 'messages',
        messageId: mockMessageId,
        activeStateType: MessageActiveStateErrorType.CONSISTENCY_ERROR,
        context,
        originalError: 'Connection timeout',
        stack: 'Error: Connection timeout\n    at test:1:1',
      });
    });
  });

  describe('static factory methods', () => {
    describe('invalidStateValue', () => {
      it('should create validation error with correct properties', () => {
        const error = MessageActiveStateError.invalidStateValue(
          mockMessageId,
          'update',
          'not-boolean',
        );

        expect(error.activeStateType).toBe(MessageActiveStateErrorType.INVALID_STATE_VALUE);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('update');
        expect(error.severity).toBe(DatabaseErrorSeverity.LOW);
        expect(error.message).toContain('string (not-boolean)');
        expect(error.message).toContain('Expected boolean');
      });

      it('should handle numeric values in error message', () => {
        const error = MessageActiveStateError.invalidStateValue(mockMessageId, 'toggle', 42);

        expect(error.message).toContain('number (42)');
      });

      it('should include original error when provided', () => {
        const originalError = new Error('Validation failed');
        const error = MessageActiveStateError.invalidStateValue(
          mockMessageId,
          'update',
          undefined,
          originalError,
        );

        expect((error.technicalDetails as any).originalError).toBe('Validation failed');
      });
    });

    describe('messageNotFound', () => {
      it('should create not found error with correct properties', () => {
        const error = MessageActiveStateError.messageNotFound(
          mockMessageId,
          'validate',
          mockConversationId,
        );

        expect(error.activeStateType).toBe(MessageActiveStateErrorType.MESSAGE_NOT_FOUND);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('validate');
        expect(error.context.conversationId).toBe(mockConversationId);
        expect(error.severity).toBe(DatabaseErrorSeverity.MEDIUM);
        expect(error.message).toBe(
          'Message not found. The message may have been deleted or moved.',
        );
      });

      it('should work without conversation ID', () => {
        const error = MessageActiveStateError.messageNotFound(mockMessageId, 'toggle');

        expect(error.context.conversationId).toBeUndefined();
      });
    });

    describe('toggleFailed', () => {
      it('should create toggle failure error with state context', () => {
        const originalError = new Error('Database locked');
        const error = MessageActiveStateError.toggleFailed(mockMessageId, true, originalError);

        expect(error.activeStateType).toBe(MessageActiveStateErrorType.TOGGLE_FAILED);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('toggle');
        expect(error.context.currentState).toBe(true);
        expect(error.context.targetState).toBe(false);
        expect(error.severity).toBe(DatabaseErrorSeverity.MEDIUM);
        expect((error.technicalDetails as any).originalError).toBe('Database locked');
      });

      it('should work without original error', () => {
        const error = MessageActiveStateError.toggleFailed(mockMessageId, false);

        expect(error.context.currentState).toBe(false);
        expect(error.context.targetState).toBe(true);
        expect((error.technicalDetails as any).originalError).toBeUndefined();
      });
    });

    describe('updateFailed', () => {
      it('should create update failure error with target state', () => {
        const originalError = new Error('Constraint violation');
        const error = MessageActiveStateError.updateFailed(
          mockMessageId,
          false,
          true,
          originalError,
        );

        expect(error.activeStateType).toBe(MessageActiveStateErrorType.UPDATE_FAILED);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('update');
        expect(error.context.currentState).toBe(true);
        expect(error.context.targetState).toBe(false);
        expect(error.severity).toBe(DatabaseErrorSeverity.MEDIUM);
        expect((error.technicalDetails as any).originalError).toBe('Constraint violation');
      });

      it('should work without current state', () => {
        const error = MessageActiveStateError.updateFailed(mockMessageId, true);

        expect(error.context.targetState).toBe(true);
        expect(error.context.currentState).toBeUndefined();
      });
    });

    describe('consistencyError', () => {
      it('should create consistency error with state comparison', () => {
        const error = MessageActiveStateError.consistencyError(
          mockMessageId,
          true,
          false,
          mockConversationId,
        );

        expect(error.activeStateType).toBe(MessageActiveStateErrorType.CONSISTENCY_ERROR);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('sync');
        expect(error.context.currentState).toBe(true);
        expect(error.context.targetState).toBe(false);
        expect(error.context.conversationId).toBe(mockConversationId);
        expect(error.severity).toBe(DatabaseErrorSeverity.HIGH);
        expect(error.message).toContain('local=true, remote=false');
      });

      it('should work without conversation ID', () => {
        const error = MessageActiveStateError.consistencyError(mockMessageId, false, true);

        expect(error.context.conversationId).toBeUndefined();
        expect(error.message).toContain('local=false, remote=true');
      });
    });

    describe('permissionDenied', () => {
      it('should create permission denied error', () => {
        const error = MessageActiveStateError.permissionDenied(
          mockMessageId,
          'update',
          mockAgentId,
        );

        expect(error.activeStateType).toBe(MessageActiveStateErrorType.PERMISSION_DENIED);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('update');
        expect(error.context.agentId).toBe(mockAgentId);
        expect(error.severity).toBe(DatabaseErrorSeverity.HIGH);
        expect(error.message).toBe(
          "You don't have permission to modify this message's active state.",
        );
      });

      it('should work without agent ID', () => {
        const error = MessageActiveStateError.permissionDenied(mockMessageId, 'toggle');

        expect(error.context.agentId).toBeUndefined();
      });
    });

    describe('transactionFailed', () => {
      it('should create transaction failure error', () => {
        const originalError = new Error('Deadlock detected');
        const error = MessageActiveStateError.transactionFailed(
          mockMessageId,
          'toggle',
          originalError,
        );

        expect(error.activeStateType).toBe(MessageActiveStateErrorType.TRANSACTION_FAILED);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('toggle');
        expect(error.severity).toBe(DatabaseErrorSeverity.HIGH);
        expect((error.technicalDetails as any).originalError).toBe('Deadlock detected');
        expect(error.message).toContain('toggling message active state');
        expect(error.message).toContain('rolled back');
      });

      it('should handle update operation in message', () => {
        const error = MessageActiveStateError.transactionFailed(mockMessageId, 'update');

        expect(error.message).toContain('updating message active state');
      });
    });
  });

  describe('user-friendly messages', () => {
    it('should generate appropriate messages for all error types', () => {
      const testCases = [
        {
          type: MessageActiveStateErrorType.INVALID_STATE_VALUE,
          context: { messageId: mockMessageId, operation: 'update' as const },
          expected: 'Invalid active state value provided for message. Expected true or false.',
        },
        {
          type: MessageActiveStateErrorType.MESSAGE_NOT_FOUND,
          context: { messageId: mockMessageId, operation: 'toggle' as const },
          expected: 'Message not found. The message may have been deleted or moved.',
        },
        {
          type: MessageActiveStateErrorType.TOGGLE_FAILED,
          context: { messageId: mockMessageId, operation: 'toggle' as const },
          expected: 'Failed to toggle message active state. Please try again.',
        },
        {
          type: MessageActiveStateErrorType.UPDATE_FAILED,
          context: { messageId: mockMessageId, operation: 'update' as const, targetState: true },
          expected: 'Failed to update message active state to active. Please try again.',
        },
        {
          type: MessageActiveStateErrorType.UPDATE_FAILED,
          context: { messageId: mockMessageId, operation: 'update' as const, targetState: false },
          expected: 'Failed to update message active state to inactive. Please try again.',
        },
        {
          type: MessageActiveStateErrorType.CONSISTENCY_ERROR,
          context: { messageId: mockMessageId, operation: 'sync' as const },
          expected:
            'Message active state is inconsistent between local and server data. Refreshing conversation...',
        },
        {
          type: MessageActiveStateErrorType.PERMISSION_DENIED,
          context: { messageId: mockMessageId, operation: 'update' as const },
          expected: "You don't have permission to modify this message's active state.",
        },
        {
          type: MessageActiveStateErrorType.TRANSACTION_FAILED,
          context: { messageId: mockMessageId, operation: 'toggle' as const },
          expected:
            'Database transaction failed while toggling message active state. Changes have been rolled back.',
        },
      ];

      testCases.forEach(({ type, context, expected }) => {
        const error = new MessageActiveStateError(type, context);
        expect(error.message).toBe(expected);
      });
    });
  });

  describe('error inheritance', () => {
    it('should extend DatabaseError properly', () => {
      const error = MessageActiveStateError.toggleFailed(mockMessageId, true);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('MessageActiveStateError');
      expect(error.code).toContain('message-active-state');
      expect(error.timestamp).toBeTypeOf('number');
      expect(error.technicalDetails).toBeTypeOf('object');
      expect(error).toHaveProperty('severity');
      expect(error).toHaveProperty('type');
    });

    it('should have proper database error properties', () => {
      const error = MessageActiveStateError.updateFailed(mockMessageId, true);

      expect(error.technicalDetails).toHaveProperty('operation');
      expect(error.technicalDetails).toHaveProperty('table', 'messages');
      expect(error.technicalDetails).toHaveProperty('messageId');
      expect(error.technicalDetails).toHaveProperty('activeStateType');
      expect(error.technicalDetails).toHaveProperty('context');
    });
  });

  describe('toJSON serialization', () => {
    it('should serialize with active state specific properties', () => {
      const context: MessageActiveStateContext = {
        messageId: mockMessageId,
        operation: 'toggle',
        currentState: true,
        targetState: false,
        conversationId: mockConversationId,
      };

      const error = new MessageActiveStateError(
        MessageActiveStateErrorType.TOGGLE_FAILED,
        context,
        'Custom error',
      );

      const json = error.toJSON();

      expect(json).toHaveProperty('name', 'MessageActiveStateError');
      expect(json).toHaveProperty('message', 'Custom error');
      expect(json).toHaveProperty('code', 'message-active-state-toggle-toggle_failed');
      expect(json).toHaveProperty('activeStateType', MessageActiveStateErrorType.TOGGLE_FAILED);
      expect(json).toHaveProperty('context', context);
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('technicalDetails');
      expect(json).toHaveProperty('severity');
      expect(json).toHaveProperty('type');
      expect(json).toHaveProperty('operation');
      expect(json).toHaveProperty('recoverable');
      expect(json).toHaveProperty('userMessage');
    });

    it('should be JSON serializable', () => {
      const error = MessageActiveStateError.consistencyError(mockMessageId, true, false);

      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe('MessageActiveStateError');
      expect(parsed.activeStateType).toBe(MessageActiveStateErrorType.CONSISTENCY_ERROR);
      expect(parsed.context).toEqual(error.context);
    });
  });

  describe('error code generation', () => {
    it('should generate consistent error codes', () => {
      const testCases = [
        {
          operation: 'toggle',
          type: MessageActiveStateErrorType.TOGGLE_FAILED,
          expected: 'message-active-state-toggle-toggle_failed',
        },
        {
          operation: 'update',
          type: MessageActiveStateErrorType.UPDATE_FAILED,
          expected: 'message-active-state-update-update_failed',
        },
        {
          operation: 'sync',
          type: MessageActiveStateErrorType.CONSISTENCY_ERROR,
          expected: 'message-active-state-sync-consistency_error',
        },
        {
          operation: 'validate',
          type: MessageActiveStateErrorType.INVALID_STATE_VALUE,
          expected: 'message-active-state-validate-invalid_state_value',
        },
      ];

      testCases.forEach(({ operation, type, expected }) => {
        const context: MessageActiveStateContext = {
          messageId: mockMessageId,
          operation: operation as any,
        };

        const error = new MessageActiveStateError(type, context);
        expect(error.code).toBe(expected);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty context fields gracefully', () => {
      const context: MessageActiveStateContext = {
        messageId: '',
        operation: 'toggle',
      };

      const error = new MessageActiveStateError(MessageActiveStateErrorType.TOGGLE_FAILED, context);

      expect(error.context.messageId).toBe('');
      expect((error.technicalDetails as any).messageId).toBe('');
    });

    it('should handle undefined optional context fields', () => {
      const context: MessageActiveStateContext = {
        messageId: mockMessageId,
        operation: 'update',
        currentState: undefined,
        targetState: undefined,
        conversationId: undefined,
        agentId: undefined,
      };

      const error = new MessageActiveStateError(MessageActiveStateErrorType.UPDATE_FAILED, context);

      expect(error.context.currentState).toBeUndefined();
      expect(error.context.targetState).toBeUndefined();
      expect(error.context.conversationId).toBeUndefined();
      expect(error.context.agentId).toBeUndefined();
    });

    it('should handle circular reference in original error', () => {
      const circularError = new Error('Circular test') as Error & { self?: unknown };
      circularError.self = circularError;

      const error = MessageActiveStateError.toggleFailed(mockMessageId, true, circularError);

      expect((error.technicalDetails as any).originalError).toBe('Circular test');
      expect((error.technicalDetails as any).stack).toBeDefined();
    });
  });
});
