import type { IPCResponse } from "../base";

/**
 * Personalities save operation response type
 *
 * Returns success status without data payload
 */
export interface PersonalitiesSaveResponse extends IPCResponse<void> {}
