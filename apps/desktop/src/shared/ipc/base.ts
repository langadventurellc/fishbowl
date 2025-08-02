import type { SerializableError } from "./types";

/**
 * Base response type for all IPC operations
 *
 * Provides a consistent response structure across all IPC operations
 * with success status, optional data payload, and standardized error format.
 */
export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: SerializableError;
}
