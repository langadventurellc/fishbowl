import type { IPCResponse } from "../../shared/ipc/base";

/**
 * Creates a standardized success response for IPC operations
 * @param data - The successful response data
 * @returns IPCResponse with success flag and data
 */
export function createSuccessResponse<T>(data: T): IPCResponse<T> {
  return {
    success: true,
    data,
  };
}
