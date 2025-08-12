import type { IPCResponse } from "../base";

/**
 * Roles save operation response type
 *
 * Returns success status without data payload
 */
export interface RolesSaveResponse extends IPCResponse<void> {}
