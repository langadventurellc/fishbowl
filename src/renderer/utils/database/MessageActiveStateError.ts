import { DatabaseError } from './DatabaseError';
import { DatabaseErrorType } from './DatabaseErrorType';
import { DatabaseErrorSeverity } from './DatabaseErrorSeverity';
import { MessageActiveStateErrorType } from './MessageActiveStateErrorType';
import { MessageActiveStateContext } from './MessageActiveStateContext';

/**
 * Comprehensive error class for message active state operations
 * Extends the established DatabaseError with active state specific context
 */
export class MessageActiveStateError extends DatabaseError {
  public readonly activeStateType: MessageActiveStateErrorType;
  public readonly context: MessageActiveStateContext;
  public readonly code: string;

  constructor(
    type: MessageActiveStateErrorType,
    context: MessageActiveStateContext,
    message?: string,
    originalError?: Error,
    severity: DatabaseErrorSeverity = DatabaseErrorSeverity.MEDIUM,
  ) {
    // Map active state error types to database error types
    const databaseType = MessageActiveStateError.mapToDatabaseErrorType(type);

    // Generate user-friendly message if not provided
    const userMessage = message ?? MessageActiveStateError.generateUserMessage(type, context);

    // Create error code combining operation and type
    const errorCode = `message-active-state-${context.operation}-${type.toLowerCase()}`;

    super(
      userMessage,
      databaseType,
      context.operation,
      severity,
      true, // recoverable
      userMessage,
      {
        operation: context.operation,
        table: 'messages',
        messageId: context.messageId,
        activeStateType: type,
        context,
        originalError: originalError?.message,
        stack: originalError?.stack,
      },
    );

    this.name = 'MessageActiveStateError';
    this.activeStateType = type;
    this.context = context;
    this.code = errorCode;
  }

  /**
   * Maps message active state error types to general database error types
   */
  private static mapToDatabaseErrorType(type: MessageActiveStateErrorType): DatabaseErrorType {
    switch (type) {
      case MessageActiveStateErrorType.INVALID_STATE_VALUE:
        return DatabaseErrorType.VALIDATION;
      case MessageActiveStateErrorType.MESSAGE_NOT_FOUND:
        return DatabaseErrorType.NOT_FOUND;
      case MessageActiveStateErrorType.PERMISSION_DENIED:
        return DatabaseErrorType.PERMISSION;
      case MessageActiveStateErrorType.TRANSACTION_FAILED:
        return DatabaseErrorType.CONFLICT;
      case MessageActiveStateErrorType.CONSISTENCY_ERROR:
        return DatabaseErrorType.CONFLICT;
      case MessageActiveStateErrorType.TOGGLE_FAILED:
      case MessageActiveStateErrorType.UPDATE_FAILED:
      default:
        return DatabaseErrorType.UNKNOWN;
    }
  }

  /**
   * Generates user-friendly error messages based on error type and context
   */
  private static generateUserMessage(
    type: MessageActiveStateErrorType,
    context: MessageActiveStateContext,
  ): string {
    const { operation, targetState } = context;

    switch (type) {
      case MessageActiveStateErrorType.INVALID_STATE_VALUE:
        return `Invalid active state value provided for message. Expected true or false.`;

      case MessageActiveStateErrorType.MESSAGE_NOT_FOUND:
        return `Message not found. The message may have been deleted or moved.`;

      case MessageActiveStateErrorType.TOGGLE_FAILED:
        return `Failed to toggle message active state. Please try again.`;

      case MessageActiveStateErrorType.UPDATE_FAILED:
        return `Failed to update message active state to ${targetState ? 'active' : 'inactive'}. Please try again.`;

      case MessageActiveStateErrorType.CONSISTENCY_ERROR:
        return `Message active state is inconsistent between local and server data. Refreshing conversation...`;

      case MessageActiveStateErrorType.PERMISSION_DENIED:
        return `You don't have permission to modify this message's active state.`;

      case MessageActiveStateErrorType.TRANSACTION_FAILED:
        return `Database transaction failed while ${operation === 'toggle' ? 'toggling' : 'updating'} message active state. Changes have been rolled back.`;

      default:
        return `Unknown error occurred while ${operation === 'toggle' ? 'toggling' : 'updating'} message active state.`;
    }
  }

  /**
   * Creates a validation error for invalid active state values
   */
  static invalidStateValue(
    messageId: string,
    operation: 'toggle' | 'update',
    value: unknown,
    originalError?: Error,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorType.INVALID_STATE_VALUE,
      { messageId, operation },
      `Invalid active state value: ${typeof value} (${String(value)}). Expected boolean.`,
      originalError,
      DatabaseErrorSeverity.LOW,
    );
  }

  /**
   * Creates a message not found error
   */
  static messageNotFound(
    messageId: string,
    operation: 'toggle' | 'update' | 'validate',
    conversationId?: string,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorType.MESSAGE_NOT_FOUND,
      { messageId, operation, conversationId },
      undefined,
      undefined,
      DatabaseErrorSeverity.MEDIUM,
    );
  }

  /**
   * Creates a toggle operation failure error
   */
  static toggleFailed(
    messageId: string,
    currentState: boolean,
    originalError?: Error,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorType.TOGGLE_FAILED,
      { messageId, operation: 'toggle', currentState, targetState: !currentState },
      undefined,
      originalError,
      DatabaseErrorSeverity.MEDIUM,
    );
  }

  /**
   * Creates an update operation failure error
   */
  static updateFailed(
    messageId: string,
    targetState: boolean,
    currentState?: boolean,
    originalError?: Error,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorType.UPDATE_FAILED,
      { messageId, operation: 'update', currentState, targetState },
      undefined,
      originalError,
      DatabaseErrorSeverity.MEDIUM,
    );
  }

  /**
   * Creates a consistency error for state mismatches
   */
  static consistencyError(
    messageId: string,
    localState: boolean,
    remoteState: boolean,
    conversationId?: string,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorType.CONSISTENCY_ERROR,
      {
        messageId,
        operation: 'sync',
        currentState: localState,
        targetState: remoteState,
        conversationId,
      },
      `Active state mismatch: local=${localState}, remote=${remoteState}`,
      undefined,
      DatabaseErrorSeverity.HIGH,
    );
  }

  /**
   * Creates a permission denied error
   */
  static permissionDenied(
    messageId: string,
    operation: 'toggle' | 'update',
    agentId?: string,
  ): MessageActiveStateError {
    return new MessageActiveStateError(
      MessageActiveStateErrorType.PERMISSION_DENIED,
      { messageId, operation, agentId },
      undefined,
      undefined,
      DatabaseErrorSeverity.HIGH,
    );
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
      MessageActiveStateErrorType.TRANSACTION_FAILED,
      { messageId, operation },
      undefined,
      originalError,
      DatabaseErrorSeverity.HIGH,
    );
  }

  /**
   * Enhanced JSON serialization including active state context
   */
  public toJSON() {
    return {
      ...super.toJSON(),
      code: this.code,
      activeStateType: this.activeStateType,
      context: this.context,
    };
  }
}
