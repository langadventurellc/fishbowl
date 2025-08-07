/**
 * Serializable error structure for IPC transport
 * Matches the error property in IPCResponse
 */
export interface SerializableError {
  message: string;
  code: string;
  context?: Record<string, unknown>; // Optional contextual data (sanitized)
  stack?: string; // Only included in development
}
