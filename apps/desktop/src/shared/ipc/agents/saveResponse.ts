import type { IPCResponse } from "../base";

/**
 * Agents save operation response type
 *
 * Returns success status without data payload
 */
export interface AgentsSaveResponse extends IPCResponse<void> {}
