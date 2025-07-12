import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  MessageActiveStateError,
  MessageActiveStateErrorCode,
  type MessageActiveStateErrorContext,
} from '../../../../../src/shared/types/errors';

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
    it('should create error with provided values', () => {
      const context: MessageActiveStateErrorContext = {
        messageId: mockMessageId,
        operation: 'toggle',
      };

      const error = new MessageActiveStateError(
        MessageActiveStateErrorCode.TOGGLE_FAILED,
        context,
        'Custom message',
      );

      expect(error.name).toBe('MessageActiveStateError');
      expect(error.errorCode).toBe(MessageActiveStateErrorCode.TOGGLE_FAILED);
      expect(error.context).toEqual(context);
      expect(error.message).toBe('Custom message');
      expect(error.code).toBe('message-active-state-toggle-toggle_failed');
    });

    it('should generate default message when none provided', () => {
      const context: MessageActiveStateErrorContext = {
        messageId: mockMessageId,
        operation: 'update',
      };

      const error = new MessageActiveStateError(MessageActiveStateErrorCode.UPDATE_FAILED, context);

      expect(error.message).toBe('Failed to update message active state');
    });

    it('should include original error information in details', () => {
      const originalError = new Error('Database connection failed');
      const context: MessageActiveStateErrorContext = {
        messageId: mockMessageId,
        operation: 'toggle',
      };

      const error = new MessageActiveStateError(
        MessageActiveStateErrorCode.TOGGLE_FAILED,
        context,
        'Custom message',
        originalError,
      );

      expect(error.details).toEqual({
        errorCode: MessageActiveStateErrorCode.TOGGLE_FAILED,
        context,
        operation: 'toggle',
        messageId: mockMessageId,
        originalError: 'Database connection failed',
      });
    });

    it('should handle complex context with all fields', () => {
      const context: MessageActiveStateErrorContext = {
        messageId: mockMessageId,
        operation: 'sync',
        currentState: true,
        targetState: false,
        conversationId: mockConversationId,
        agentId: mockAgentId,
      };

      const error = new MessageActiveStateError(
        MessageActiveStateErrorCode.CONSISTENCY_ERROR,
        context,
      );

      expect(error.context).toEqual(context);
      expect(error.code).toBe('message-active-state-sync-consistency_error');
    });
  });

  describe('static factory methods', () => {
    describe('invalidStateValue', () => {
      it('should create validation error for invalid boolean value', () => {
        const error = MessageActiveStateError.invalidStateValue(
          mockMessageId,
          'update',
          'not-a-boolean',
        );

        expect(error.errorCode).toBe(MessageActiveStateErrorCode.INVALID_STATE_VALUE);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('update');
        expect(error.message).toContain('not-a-boolean');
        expect(error.message).toContain('Expected boolean');
      });

      it('should handle numeric values', () => {
        const error = MessageActiveStateError.invalidStateValue(mockMessageId, 'toggle', 1);

        expect(error.message).toContain('number (1)');
      });

      it('should handle null values', () => {
        const error = MessageActiveStateError.invalidStateValue(mockMessageId, 'update', null);

        expect(error.message).toContain('object (null)');
      });
    });

    describe('messageNotFound', () => {
      it('should create not found error', () => {
        const error = MessageActiveStateError.messageNotFound(mockMessageId, 'validate');

        expect(error.errorCode).toBe(MessageActiveStateErrorCode.MESSAGE_NOT_FOUND);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('validate');
        expect(error.message).toBe('Message not found');
      });
    });

    describe('toggleFailed', () => {
      it('should create toggle failure error', () => {
        const originalError = new Error('Database timeout');
        const error = MessageActiveStateError.toggleFailed(mockMessageId, originalError);

        expect(error.errorCode).toBe(MessageActiveStateErrorCode.TOGGLE_FAILED);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('toggle');
        expect((error.details as any).originalError).toBe('Database timeout');
      });

      it('should create error without original error', () => {
        const error = MessageActiveStateError.toggleFailed(mockMessageId);

        expect(error.errorCode).toBe(MessageActiveStateErrorCode.TOGGLE_FAILED);
        expect((error.details as any).originalError).toBeUndefined();
      });
    });

    describe('updateFailed', () => {
      it('should create update failure error with target state', () => {
        const originalError = new Error('Constraint violation');
        const error = MessageActiveStateError.updateFailed(mockMessageId, true, originalError);

        expect(error.errorCode).toBe(MessageActiveStateErrorCode.UPDATE_FAILED);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('update');
        expect(error.context.targetState).toBe(true);
        expect((error.details as any).originalError).toBe('Constraint violation');
      });

      it('should handle false target state', () => {
        const error = MessageActiveStateError.updateFailed(mockMessageId, false);

        expect(error.context.targetState).toBe(false);
      });
    });

    describe('consistencyError', () => {
      it('should create consistency error with state comparison', () => {
        const error = MessageActiveStateError.consistencyError(mockMessageId, true, false);

        expect(error.errorCode).toBe(MessageActiveStateErrorCode.CONSISTENCY_ERROR);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('sync');
        expect(error.context.currentState).toBe(true);
        expect(error.context.targetState).toBe(false);
        expect(error.message).toContain('local=true, remote=false');
      });
    });

    describe('permissionDenied', () => {
      it('should create permission denied error', () => {
        const error = MessageActiveStateError.permissionDenied(mockMessageId, 'update');

        expect(error.errorCode).toBe(MessageActiveStateErrorCode.PERMISSION_DENIED);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('update');
        expect(error.message).toBe('Permission denied for message active state operation');
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

        expect(error.errorCode).toBe(MessageActiveStateErrorCode.TRANSACTION_FAILED);
        expect(error.context.messageId).toBe(mockMessageId);
        expect(error.context.operation).toBe('toggle');
        expect((error.details as any).originalError).toBe('Deadlock detected');
      });
    });
  });

  describe('default messages', () => {
    it('should provide appropriate default messages for all error codes', () => {
      const testCases = [
        {
          code: MessageActiveStateErrorCode.INVALID_STATE_VALUE,
          expected: 'Invalid active state value provided',
        },
        { code: MessageActiveStateErrorCode.MESSAGE_NOT_FOUND, expected: 'Message not found' },
        {
          code: MessageActiveStateErrorCode.TOGGLE_FAILED,
          expected: 'Failed to toggle message active state',
        },
        {
          code: MessageActiveStateErrorCode.UPDATE_FAILED,
          expected: 'Failed to update message active state',
        },
        {
          code: MessageActiveStateErrorCode.CONSISTENCY_ERROR,
          expected: 'Message active state consistency error',
        },
        {
          code: MessageActiveStateErrorCode.PERMISSION_DENIED,
          expected: 'Permission denied for message active state operation',
        },
        {
          code: MessageActiveStateErrorCode.TRANSACTION_FAILED,
          expected: 'Transaction failed during active state operation',
        },
      ];

      testCases.forEach(({ code, expected }) => {
        const context: MessageActiveStateErrorContext = {
          messageId: mockMessageId,
          operation: 'toggle',
        };

        const error = new MessageActiveStateError(code, context);
        expect(error.message).toBe(expected);
      });
    });
  });

  describe('error inheritance', () => {
    it('should extend BaseError properly', () => {
      const error = MessageActiveStateError.toggleFailed(mockMessageId);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('MessageActiveStateError');
      expect(error.code).toContain('message-active-state');
      expect(error.timestamp).toBeTypeOf('number');
      expect(error.details).toBeTypeOf('object');
    });

    it('should have proper timestamp and details', () => {
      const error = MessageActiveStateError.updateFailed(mockMessageId, true);

      expect(error.timestamp).toBeGreaterThan(0);
      expect(error.details).toHaveProperty('errorCode');
      expect(error.details).toHaveProperty('context');
      expect(error.details).toHaveProperty('operation');
      expect(error.details).toHaveProperty('messageId');
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON properly', () => {
      const context: MessageActiveStateErrorContext = {
        messageId: mockMessageId,
        operation: 'toggle',
        currentState: true,
        conversationId: mockConversationId,
      };

      const error = new MessageActiveStateError(
        MessageActiveStateErrorCode.TOGGLE_FAILED,
        context,
        'Custom error message',
      );

      const json = JSON.parse(JSON.stringify(error));

      expect(json.name).toBe('MessageActiveStateError');
      expect(json.message).toBe('Custom error message');
      expect(json.code).toBe('message-active-state-toggle-toggle_failed');
      expect(json.timestamp).toBeTypeOf('number');
      expect(json.details).toHaveProperty('errorCode');
      expect(json.details).toHaveProperty('context');
    });
  });

  describe('error code generation', () => {
    it('should generate consistent error codes', () => {
      const testCases = [
        {
          operation: 'toggle',
          code: MessageActiveStateErrorCode.TOGGLE_FAILED,
          expected: 'message-active-state-toggle-toggle_failed',
        },
        {
          operation: 'update',
          code: MessageActiveStateErrorCode.UPDATE_FAILED,
          expected: 'message-active-state-update-update_failed',
        },
        {
          operation: 'sync',
          code: MessageActiveStateErrorCode.CONSISTENCY_ERROR,
          expected: 'message-active-state-sync-consistency_error',
        },
        {
          operation: 'validate',
          code: MessageActiveStateErrorCode.INVALID_STATE_VALUE,
          expected: 'message-active-state-validate-invalid_state_value',
        },
      ];

      testCases.forEach(({ operation, code, expected }) => {
        const context: MessageActiveStateErrorContext = {
          messageId: mockMessageId,
          operation: operation as any,
        };

        const error = new MessageActiveStateError(code, context);
        expect(error.code).toBe(expected);
      });
    });
  });
});
