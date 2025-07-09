import { BaseError } from './base-error';

/**
 * Error thrown when secure storage operations fail
 */
export class SecureStorageError extends BaseError {
  public readonly operation?: string;
  public readonly service?: string;

  constructor(message: string, operation?: string, service?: string, details?: unknown) {
    super(message, 'SECURE_STORAGE_ERROR', details);
    this.operation = operation;
    this.service = service;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      operation: this.operation,
      service: this.service,
    };
  }
}
