import { BaseError } from './base-error';

/**
 * Error thrown when IPC communication fails
 */
export class IpcError extends BaseError {
  public readonly channel?: string;
  public readonly operation?: string;

  constructor(message: string, channel?: string, operation?: string, details?: unknown) {
    super(message, 'IPC_ERROR', details);
    this.channel = channel;
    this.operation = operation;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      channel: this.channel,
      operation: this.operation,
    };
  }
}
