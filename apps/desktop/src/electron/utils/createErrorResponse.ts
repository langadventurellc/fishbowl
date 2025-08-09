import type { IPCResponse } from "../../shared/ipc/base";
import { serializeError } from "./errorSerialization";

/**
 * Creates a standardized error response for IPC operations
 * @param error - The error to serialize and return
 * @returns IPCResponse with failure flag and serialized error
 */
export function createErrorResponse(error: unknown): IPCResponse<never> {
  return {
    success: false,
    error: serializeError(error),
  };
}
