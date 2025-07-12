import type { MessageErrorType } from './MessageErrorType';

/**
 * Interface for structured error information in message operations
 */
export interface MessageError {
  type: MessageErrorType;
  message: string;
  operation?: string;
  retryable: boolean;
}
