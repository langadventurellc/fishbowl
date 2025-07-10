import { BaseError } from './base-error';

/**
 * Error thrown when IPC input validation fails
 */
export class IpcValidationError extends BaseError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown, details?: unknown) {
    super(message, 'IPC_VALIDATION_ERROR', details);
    this.field = field;
    this.value = value;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
    };
  }
}
