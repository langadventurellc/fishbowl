import { BaseError } from './base-error';
import { MessageActiveStateErrorCode } from './messageActiveStateErrorCode';
import { MessageActiveStateErrorContext } from './messageActiveStateErrorContext';

/**
 * Shared error class for message active state operations in IPC communication
 * Lightweight version of the renderer error for main-renderer communication
 */
export class MessageActiveStateError extends BaseError {
  public readonly errorCode: MessageActiveStateErrorCode;
  public readonly context: MessageActiveStateErrorContext;

  constructor(
    errorCode: MessageActiveStateErrorCode,
    context: MessageActiveStateErrorContext,
    message?: string,
    originalError?: Error,
  ) {
    const errorMessage = message ?? MessageActiveStateError.getDefaultMessage(errorCode, context);

    super(errorMessage, `message-active-state-${context.operation}-${errorCode.toLowerCase()}`, {
      errorCode,
      context,
      operation: context.operation,
      messageId: context.messageId,
      originalError: originalError?.message,
    });

    this.name = 'MessageActiveStateError';
    this.errorCode = errorCode;
    this.context = context;
  }

  /**
   * Gets default error messages for error codes
   */
  private static getDefaultMessage(
    errorCode: MessageActiveStateErrorCode,
    _context: MessageActiveStateErrorContext,
  ): string {
    switch (errorCode) {
      case MessageActiveStateErrorCode.INVALID_STATE_VALUE:
        return 'Invalid active state value provided';
      case MessageActiveStateErrorCode.MESSAGE_NOT_FOUND:
        return 'Message not found';
      case MessageActiveStateErrorCode.TOGGLE_FAILED:
        return 'Failed to toggle message active state';
      case MessageActiveStateErrorCode.UPDATE_FAILED:
        return 'Failed to update message active state';
      case MessageActiveStateErrorCode.CONSISTENCY_ERROR:
        return 'Message active state consistency error';
      case MessageActiveStateErrorCode.PERMISSION_DENIED:
        return 'Permission denied for message active state operation';
      case MessageActiveStateErrorCode.TRANSACTION_FAILED:
        return 'Transaction failed during active state operation';
      default:
        return 'Unknown message active state error';
    }
  }

  /**
   * Creates a validation error for invalid state values
   */
  static invalidStateValue(
    messageId: string,
    operation: 'toggle' | 'update',
    value: unknown,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorCode.INVALID_STATE_VALUE,
      { messageId, operation },
      `Invalid active state value: ${typeof value} (${String(value)}). Expected boolean.`,
    );
  }

  /**
   * Creates a message not found error
   */
  static messageNotFound(
    messageId: string,
    operation: 'toggle' | 'update' | 'validate',
  ): MessageActiveStateError {
    return new MessageActiveStateError(MessageActiveStateErrorCode.MESSAGE_NOT_FOUND, {
      messageId,
      operation,
    });
  }

  /**
   * Creates a toggle failure error
   */
  static toggleFailed(messageId: string, originalError?: Error): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorCode.TOGGLE_FAILED,
      { messageId, operation: 'toggle' },
      undefined,
      originalError,
    );
  }

  /**
   * Creates an update failure error
   */
  static updateFailed(
    messageId: string,
    targetState: boolean,
    originalError?: Error,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorCode.UPDATE_FAILED,
      { messageId, operation: 'update', targetState },
      undefined,
      originalError,
    );
  }

  /**
   * Creates a consistency error
   */
  static consistencyError(
    messageId: string,
    localState: boolean,
    remoteState: boolean,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorCode.CONSISTENCY_ERROR,
      { messageId, operation: 'sync', currentState: localState, targetState: remoteState },
      `Active state mismatch: local=${localState}, remote=${remoteState}`,
    );
  }

  /**
   * Creates a permission denied error
   */
  static permissionDenied(
    messageId: string,
    operation: 'toggle' | 'update',
  ): MessageActiveStateError {
    return new MessageActiveStateError(MessageActiveStateErrorCode.PERMISSION_DENIED, {
      messageId,
      operation,
    });
  }

  /**
   * Creates a transaction failure error
   */
  static transactionFailed(
    messageId: string,
    operation: 'toggle' | 'update',
    originalError?: Error,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorCode.TRANSACTION_FAILED,
      { messageId, operation },
      undefined,
      originalError,
    );
  }
}
