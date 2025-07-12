/**
 * Error handling for IPC communication
 */

export class IpcError extends Error {
  constructor(
    message: string,
    public channel: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'IpcError';
    this.channel = channel;
    this.originalError = originalError;
  }
}
