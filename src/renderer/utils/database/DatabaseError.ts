import { DatabaseErrorSeverity } from './DatabaseErrorSeverity';
import { DatabaseErrorType } from './DatabaseErrorType';

/**
 * Structured database error class
 */

export class DatabaseError extends Error {
  public readonly type: DatabaseErrorType;
  public readonly severity: DatabaseErrorSeverity;
  public readonly operation: string;
  public readonly timestamp: number;
  public readonly recoverable: boolean;
  public readonly userMessage: string;
  public readonly technicalDetails?: unknown;

  constructor(
    message: string,
    type: DatabaseErrorType,
    operation: string,
    severity: DatabaseErrorSeverity = DatabaseErrorSeverity.MEDIUM,
    recoverable: boolean = true,
    userMessage?: string,
    technicalDetails?: unknown,
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.type = type;
    this.severity = severity;
    this.operation = operation;
    this.timestamp = Date.now();
    this.recoverable = recoverable;
    this.userMessage = userMessage ?? this.generateUserFriendlyMessage();
    this.technicalDetails = technicalDetails;
  }

  private generateUserFriendlyMessage(): string {
    switch (this.type) {
      case DatabaseErrorType.CONNECTION:
        return 'Unable to connect to the database. Please check your connection and try again.';
      case DatabaseErrorType.VALIDATION:
        return 'The information provided is not valid. Please check your input and try again.';
      case DatabaseErrorType.NOT_FOUND:
        return 'The requested item could not be found.';
      case DatabaseErrorType.PERMISSION:
        return 'You do not have permission to perform this action.';
      case DatabaseErrorType.CONFLICT:
        return 'This action conflicts with existing data. Please resolve the conflict and try again.';
      case DatabaseErrorType.TIMEOUT:
        return 'The operation took too long to complete. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      operation: this.operation,
      timestamp: this.timestamp,
      recoverable: this.recoverable,
      userMessage: this.userMessage,
      technicalDetails: this.technicalDetails,
    };
  }
}
