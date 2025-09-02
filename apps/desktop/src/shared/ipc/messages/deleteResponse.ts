import type { IPCResponse } from "../base";

/**
 * Messages delete operation response type
 *
 * Returns success indicator for message deletion
 */
export interface MessagesDeleteResponse extends IPCResponse<boolean> {}
